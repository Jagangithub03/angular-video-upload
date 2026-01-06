import { initializeApp } from 'firebase/app';
import { getFirestore,collection,addDoc,query,orderBy,onSnapshot,updateDoc,doc,deleteDoc,getDoc } from 'firebase/firestore';
import { getStorage,ref,uploadBytesResumable,uploadBytes,getDownloadURL,deleteObject } from 'firebase/storage';
import { environment } from '../environments/environment';

export class FirebaseClient {
  private app = initializeApp(environment.firebase);
  private db = getFirestore(this.app);
  private storage = getStorage(this.app);

    constructor() {
    console.log(
      '🔥 USING BUCKET:',
      this.storage.app.options.storageBucket
    );
  }

  subscribeFiles(cb: (items: any[]) => void) {
    const q = query(collection(this.db, 'videos'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      cb(items);
    });
  }

  async uploadFile(file: File, onProgress?: (p: number) => void, duration?: string, thumbnailBlob?: Blob) {
    const path = `uploads/${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, path);
    const task = uploadBytesResumable(storageRef, file);

    return new Promise<void>((resolve, reject) => {
      task.on(
        'state_changed',
        snapshot => {
          if (onProgress && snapshot.totalBytes) {
            const p = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            onProgress(p);
          }
        },
        err => reject(err),
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          let thumbUrl = '';

          if (thumbnailBlob) {
            const thumbPath = `thumbnails/${Date.now()}_${file.name}.jpg`;
            const thumbRef = ref(this.storage, thumbPath);
            await uploadBytes(thumbRef, thumbnailBlob);
            thumbUrl = await getDownloadURL(thumbRef);
          }

          await addDoc(collection(this.db, 'videos'), {
            name: file.name,
            storagePath: path,
            url,
            thumbnail: thumbUrl || '',
            duration: duration || '00:00',
            status: 'Visible',
            createdAt: new Date().toISOString(),
            size: Math.round(file.size / (1024 * 1024)) + ' MB'
          });

          resolve();
        }
      );
    });
  }

  async updateVisibility(id: string, visible: boolean) {
    await updateDoc(doc(this.db, 'videos', id), { status: visible ? 'Visible' : 'Hidden' });
  }

  async deleteFile(id: string) {
    const dRef = doc(this.db, 'videos', id);
    const snap = await getDoc(dRef);
    const data = snap.data() as any;

    if (data?.storagePath) {
      try {
        await deleteObject(ref(this.storage, data.storagePath));
      } catch (e) {
        console.warn(e);
      }
    }

    if (data?.thumbnail) {
      try {
        const thumbPath = data.thumbnail.split('/o/')[1].split('?')[0];
        await deleteObject(ref(this.storage, decodeURIComponent(thumbPath)));
      } catch (e) {
        console.warn('Thumbnail delete failed', e);
      }
    }

    await deleteDoc(dRef);
  }
}
