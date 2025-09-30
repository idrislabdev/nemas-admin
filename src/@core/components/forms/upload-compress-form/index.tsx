/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Attachment01,
  Trash01,
  UploadCloud01,
  UploadCloud02,
} from '@untitled-ui/icons-react';
import React, { useEffect, useRef, useState } from 'react';

const UploadCompressForm = (props: {
  index: number;
  label: string;
  isOptional: boolean;
  initUrl?: string;
  initFile?: File | null;
  errorState?: boolean;
  onChange: (value: File | null) => void;
}) => {
  const { index, label, isOptional, initUrl, initFile, errorState, onChange } =
    props;
  const [photoUrl, setPhotoUrl] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [extension, setExtension] = useState('');
  const inputFile = useRef<HTMLInputElement[]>([]);
  const removePhoto = () => {
    console.log(photo);
    setPhoto(null);
    onChange(null);
    setPhotoUrl('');
    const value = inputFile.current[index]?.value;
    if (value) {
      inputFile.current[index].value = '';
    }
  };

  const onChangePhoto = () => {
    const files = inputFile.current[index]?.files;
    if (files) {
      const fileName = files[0].name;
      const idxDot = fileName.lastIndexOf('.') + 1;
      const extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
      setExtension(extFile);
      if (files[0].size > 500000) {
        alert(
          'File yang anda pilih tidak dapat diunggah karena ukuran terlalu besar. Harap unggah kembali dengan ukuran file yang lebih kecil.'
        );
        inputFile.current[index].value = '';
      } else {
        setPhotoUrl(URL.createObjectURL(files[0]));
        setPhoto(files[0]);
        onChange(files[0]);
      }
    }
  };

  useEffect(() => {
    if (initFile == null && initUrl == '') {
      setPhoto(null);
      setPhotoUrl('');
      onChange(null);
    }
  }, [initFile, initUrl, onChange]);

  useEffect(() => {
    if (initUrl && initUrl !== '') {
      const idxDot = initUrl.lastIndexOf('.') + 1;
      const extFile = initUrl.substr(idxDot, initUrl.length).toLowerCase();
      setPhotoUrl(initUrl);
      setExtension(extFile);
    }
  }, [initUrl]);

  return (
    <>
      <div className="flex flex-col gap-[6px]">
        {label != '' && (
          <label className="text-gray-700 text-sm font-medium">
            {label}{' '}
            {isOptional ? (
              <span className="text-xs text-gray-400">opsional</span>
            ) : (
              <span className="text-xs text-brand-600">*</span>
            )}
          </label>
        )}
        <div
          className={`border rounded-[12px] h-[126px] p-[16px] bg-white ${
            errorState ? 'border-error-300' : 'border-gray-200'
          }`}
        >
          {photoUrl == '' && (
            <label
              className="flex flex-col justify-center items-center gap-[12px] cursor-pointer"
              htmlFor={`file-upload-${index}`}
            >
              <div className="border border-gray-200 rounded-[8px] w-[40px] h-[40px] flex flex-col justify-center items-center">
                <span className="text-gray-600">
                  <UploadCloud02 />
                </span>
              </div>
              <div className="flex flex-col justify-center items-center gap-[4px]">
                <h6 className="text-sm font-normal text-gray-600">
                  <span className="text-brand-600 font-semibold">
                    Klik untuk mengunggah
                  </span>{' '}
                  atau tarik dan lepas
                </h6>
                <p className="text-xs text-gray-600">ZIP atau RAR</p>
              </div>
            </label>
          )}
          {photoUrl != '' && (
            <div className="flex items-center gap-[12px]">
              <span className="my-icon icon-2xl text-neutral-500 border-2 rounded">
                <Attachment01 />
              </span>
              <div className="flex flex-col gap-[12px]">
                <div className="flex flex-col gap-[4px]">
                  <label className="text-sm text-brand-600">
                    file.{extension}
                  </label>
                  {/* <span className="text-xs text-gray-600">178 Kb</span> */}
                </div>
                <div className="flex items-center gap-[6px]">
                  <label
                    className="w-[28px] h-[28px] border border-gray-300 flex flex-col justify-center items-center rounded-[6px] text-gray-400 cursor-pointer"
                    htmlFor={`file-upload-${index}`}
                  >
                    <span className="my-icon icon-xs">
                      <UploadCloud01 />
                    </span>
                  </label>
                  <button
                    className="w-[28px] h-[28px] border border-gray-300 flex flex-col justify-center items-center rounded-[6px] text-gray-400"
                    onClick={removePhoto}
                  >
                    <span className="my-icon icon-xs">
                      <Trash01 />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
          <input
            id={`file-upload-${index}`}
            ref={(el: any) => (inputFile.current[index] = el)}
            accept={`.rar, .zip'`}
            type="file"
            name="file"
            className="hidden"
            onChange={onChangePhoto}
          />
        </div>
        {errorState && (
          <span className="text-sm text-error-600">
            Harap lengkapi form terlebih dahulu
          </span>
        )}
      </div>
    </>
  );
};

export default UploadCompressForm;
