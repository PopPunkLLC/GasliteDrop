import React, { useState } from "react";
import { Icon } from "@iconify/react";
import type { ParseResult } from "papaparse";
import { useCSVReader } from "react-papaparse";
import { toast } from "sonner";
import { findDuplicateTokenIds } from "../types/parsers";

interface ICSVUploadProps<T = string[]> {
  standard: string;
  onUpload: (data: ParseResult<T>) => void;
  onReset: () => void;
}

export default function CSVUpload<T = string[]>({
  standard,
  onUpload,
  onReset,
}: ICSVUploadProps<T>) {
  const [fileCompleted, setFileCompleted] = useState<
    "success" | "error" | false
  >(false);

  const { CSVReader } = useCSVReader();

  // Trim any preceeding spaces from the amount/token ID column
  const trimAmounts = (data: ParseResult<T>): ParseResult<T> => {
    const trimmedData: ParseResult<T> = JSON.parse(JSON.stringify(data));
    trimmedData.data = data.data.map((row) => {
      if (Array.isArray(row)) {
        return row.map((cell, index) => (index === 1 ? cell.trim() : cell));
      }
      return row;
    }) as any[];

    return trimmedData;
  };

  return (
    <CSVReader
      header={false}
      config={{
        worker: true,
        skipEmptyLines: true,
      }}
      onUploadAccepted={(data: ParseResult<T>) => {
        const trimmedData = trimAmounts(data);

        if (standard === "ERC20" || standard === "ERC1155") {
          if (data.errors.length > 0) {
            console.error(data.errors);
            setFileCompleted("error");
            return toast.error(
              "Error while processing CSV file. Fix and try again."
            );
          } else {
            setFileCompleted("success");
            return onUpload(trimmedData);
          }
        } else if (standard === "ERC721") {
          const duplicateIDs = findDuplicateTokenIds(
            trimmedData.data as [string, string][]
          );

          if (duplicateIDs.length > 0) {
            setFileCompleted("error");
            toast.error(
              `Check your CSV, duplicate IDs were found for ID${
                duplicateIDs.length === 1 ? "" : "s"
              }: ${duplicateIDs.join(", ")}`
            );
            return;
          }

          if (data.errors.length > 0) {
            setFileCompleted("error");
            console.error(data.errors);
            return toast.error(
              "There was an error while processing CSV file. Fix and try again."
            );
          } else {
            setFileCompleted("success");
            return onUpload(trimmedData);
          }
        }
      }}
      onUploadRejected={() => {
        setFileCompleted("error");
        toast.error(
          "Upload rejected - check to make sure your CSV is properly formatted"
        );
      }}
      onDragOver={(event: DragEvent) => event.preventDefault()}
      onDragLeave={(event: DragEvent) => event.preventDefault()}
    >
      {({
        getRootProps,
        acceptedFile,
        ProgressBar,
        getRemoveFileProps,
      }: any) => {
        const { onClick: removeOnClick, ...removeFileProps } =
          getRemoveFileProps();
        return (
          <>
            <div
              className="items-center border-2 border-neutral-700 rounded-lg flex flex-col h-full justify-center p-5 mt-10 cursor-pointer relative bg-white hover:bg-black/[.07]"
              {...getRootProps()}
            >
              <div className="space-y-6 text-center flex flex-col items-center">
                <div className="flex justify-center items-center w-14 h-14 border-[1px] border-markPink-500 rounded-lg">
                  <Icon
                    width="25"
                    className="text-primary"
                    icon="ri:file-upload-fill"
                  />
                </div>
                <h4 className="text-base-100 text">
                  Click to upload or drag and drop
                </h4>
                <p className="text-neutral-400 text-sm">.CSV (max 100 MB)</p>
              </div>
            </div>

            {acceptedFile && (
              <div className="items-center border-2 border-grey/[.25] rounded-lg flex flex-col h-full justify-center p-5 my-10 space-y-2 cursor-pointer relative bg-white hover:bg-grey/[.16]">
                <div className="flex flex-row w-full items-center justify-center">
                  <span className="text-left text-base-100 mr-auto">
                    {acceptedFile.name}
                  </span>
                  <div className="badge badge-primary badge-outline px-3 py-2 text text-grey mr-2">
                    {!fileCompleted && "Loading..."}
                    {fileCompleted === "success" && "Uploaded"}
                    {fileCompleted === "error" && "Error"}
                  </div>

                  <div
                    className="text-right cursor-pointer"
                    {...removeFileProps}
                    onClick={(event) => {
                      removeOnClick(event);
                      onReset();
                      setFileCompleted(false);
                    }}
                    onMouseOver={(event: Event) => event.preventDefault()}
                    onMouseOut={(event: Event) => event.preventDefault()}
                  >
                    <Icon
                      width="18"
                      className="text-critical"
                      icon="ri:delete-bin-fill"
                    />
                  </div>
                </div>

                <div className="flex flex-row w-full">
                  <div className="w-full p-0 rounded-3xl bg-neutral-700">
                    <ProgressBar className="!bg-primary !p-0 !rounded-3xl" />
                  </div>
                </div>
              </div>
            )}
          </>
        );
      }}
    </CSVReader>
  );
}
