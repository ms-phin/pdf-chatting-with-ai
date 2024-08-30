"use client";

import { useUser } from "@clerk/nextjs";
import { db, storage } from "@/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { doc, setDoc } from "firebase/firestore";
import { generatingEmedding } from "@/actions/generateEmbedding";

export enum StatusText {
  UPLOADING = "Uploading file ...",
  UPLOADED = "File uploaded successfully",
  SAVING = "Saving file to database ...",
  GENERATING = "Generating AI Emebedding, This will only take a few seconds...",
}

export type status = StatusText[keyof StatusText];

function useUpload() {
  const [progress, setProgress] = useState<number | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [status, setStatus] = useState<status | null>(null);
  const { user } = useUser();
  const router = useRouter();

  const handleUpload = async (file: File) => {
    if (!file || !user) return;

    const fileToUploadTo = uuidv4();

    const storageRef = ref(storage, `users/${user.id}/files/${fileToUploadTo}`);
    console.log("what is going on", storageRef);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setStatus(StatusText.UPLOADING);
        setProgress(percent);
      },
      (error) => {
        console.error("Error uploading file", error);
      },
      async () => {
        setStatus(StatusText.UPLOADED);

        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        console.log("downloadUrl", downloadUrl);
        setStatus(StatusText.SAVING);
        await setDoc(doc(db, "users", user.id, "files", fileToUploadTo), {
          name: file.name,
          size: file.size,
          type: file.type,
          downloadUrl: downloadUrl,
          ref: uploadTask.snapshot.ref.fullPath,
          createdAt: new Date(),
        }).catch((error) => {
          console.error("Error saving document to Firestore", error);
        });

        setStatus(StatusText.GENERATING);
        // Generating AI Embedding
        await generatingEmedding(fileToUploadTo);

        setFileId(fileToUploadTo);
      }
    );
  };
  return { progress, status, fileId, handleUpload };
}

export default useUpload;
