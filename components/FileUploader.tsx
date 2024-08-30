"use client";

import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";

import {
  ArrowDownToLine,
  CheckCircleIcon,
  HammerIcon,
  RocketIcon,
  SaveIcon,
} from "lucide-react";
import useUpload, { StatusText } from "@/hooks/useUpload";
import { useRouter } from "next/navigation";

const FileUploader = () => {
  const { progress, status, fileId, handleUpload } = useUpload();
  const router = useRouter();

  useEffect(() => {
    if (fileId) {
      router.push(`/dashboard/files/${fileId}`);
    }
  }, [fileId, router]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Do something with the files
    const file = acceptedFiles[0];
    if (file) {
      await handleUpload(file);
    }
    console.log(acceptedFiles);
  }, []);

  const statusIcons: {
    [key in StatusText]: JSX.Element;
  } = {
    [StatusText.UPLOADING]: <RocketIcon className="h-20 w-20 text-gray-600 " />,
    [StatusText.UPLOADED]: (
      <CheckCircleIcon className="h-20 w-20 text-gray-600" />
    ),
    [StatusText.SAVING]: <SaveIcon className="h-20 w-20 text-gray-600" />,
    [StatusText.GENERATING]: (
      <HammerIcon className="h-20 w-20 animate-bounce" />
    ),
  };

  const { getRootProps, getInputProps, isFocused, isDragActive, isDragAccept } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [],
      },
      multiple: false,
    });

  const uploadInProgress = progress != null && progress >= 0 && progress <= 100;

  return (
    <div className="flex flex-col gap-4 items-center max-w-7xl mx-auto ">
      {uploadInProgress && (
        <div className="mt-32 flex flex-col justify-center items-center">
          <div
            className={`radial-progress bg-slate-500 text-white border-gray-600 border-4 ${
              progress === 100 && "hidden"
            }`}
            role="progress"
            style={{
              //@ts-ignore
              "--value": progress,
              "--size": "12rem",
              "--thickness": "1.3rem",
            }}
          >
            {progress}%
          </div>
          {
            //@ts-ignore
            statusIcons[status!]
          }
          {
            //@ts-ignore}
            <p>{status}</p>
          }{" "}
        </div>
      )}

      {!uploadInProgress && (
        <div
          {...getRootProps()}
          className={`p-10 border-2 border-dashed mt-10 w-[98%] border-gray-600 text-gray-700 rounded-lg h-96 flex items-center justify-center ${
            isFocused || isDragAccept ? "bg-gray-300" : "bg-gray-200"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col justify-center items-center">
            {isDragActive ? (
              <>
                <RocketIcon className="h-20 animate-ping" />
                <p>Drop the files here ...</p>
              </>
            ) : (
              <>
                <ArrowDownToLine className="h-20 w-20 animate-bounce" />
                <p>
                  Drag &#39;n&#39; drop some files here, or click to select
                  files
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
