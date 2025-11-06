/* eslint-disable @typescript-eslint/no-explicit-any */

import { X } from '@untitled-ui/icons-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const UploadMiniForm = (props: {
  index: number;
  withFile: boolean;
  label: string;
  isOptional: boolean;
  initFile?: File | null;
  initUrl?: string;
  height?: number;
  isError?: boolean;
  onChange: (value: File | null) => void;
}) => {
  const {
    index,
    withFile,
    label,
    initFile,
    initUrl,
    isError,
    onChange,
    height,
  } = props;
  const [photoUrl, setPhotoUrl] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  const inputFile = useRef<HTMLInputElement[]>([]);

  const removePhoto = () => {
    setPhoto(null);
    setPhotoUrl('');
    const value = inputFile.current[index]?.value;
    if (value) {
      inputFile.current[index].value = '';
    }
    onChange(null);
  };

  const onChangePhoto = () => {
    const files = inputFile.current[index]?.files;
    if (files && files[0]) {
      const file = files[0];

      // 🔴 Cek ukuran file maksimal 2MB
      if (file.size > MAX_FILE_SIZE) {
        window.alert('Ukuran file maksimal 2MB!');
        inputFile.current[index].value = ''; // reset input
        return;
      }

      setPhotoUrl(URL.createObjectURL(file));
      setPhoto(file);
      onChange(file);
    }
  };

  useEffect(() => {
    if (initFile == null && initUrl == '') {
      setPhoto(null);
      setPhotoUrl('');
    }
  }, [initFile, initUrl]);

  useEffect(() => {
    if (initUrl && initUrl !== '') {
      setPhotoUrl(initUrl);
    }
  }, [initUrl]);

  useEffect(() => {
    console.log(photo);
  }, [photo]);

  return (
    <div className="flex flex-col gap-[4px] w-full h-full relative">
      <div
        className={`border rounded-[4px] p-[4px] bg-white flex flex-col justify-center h-full ${
          isError
            ? 'border-red-500 border-dashed text-red-500'
            : 'border-gray-200'
        }`}
        style={{ height: height }}
      >
        {photoUrl == '' && (
          <label
            className="flex flex-col justify-center items-center gap-[12px] cursor-pointer"
            htmlFor={`file-upload-${index}`}
          >
            <span className="text-xs text-center">Upload File {label}</span>
          </label>
        )}
        {photoUrl != '' && (
          <>
            <Image
              src={photoUrl}
              width={0}
              height={0}
              alt="image"
              className="w-full h-full rounded-[12px] border border-gray-100 object-cover"
              unoptimized={true}
            />
            <button
              className="w-[18px] h-[18px] border border-gray-200 bg-gray-200 flex flex-col justify-center items-center rounded-[4px] text-gray-400 absolute top-[-5px] right-[-5px]"
              onClick={removePhoto}
              type="button"
            >
              <span className="my-icon icon-xs">
                <X />
              </span>
            </button>
          </>
        )}
        <input
          id={`file-upload-${index}`}
          ref={(el: any) => (inputFile.current[index] = el)}
          accept={`.jpg, .jpeg, .png${withFile ? ',.pdf' : ''}`}
          type="file"
          name="file"
          className="hidden"
          onChange={onChangePhoto}
        />
      </div>
    </div>
  );
};

export default UploadMiniForm;
