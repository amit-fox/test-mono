import React, { useEffect } from "react";

const ImageList = ({ files, removeHandler }) => {
  console.log("rendering Imagelist");
  useEffect(() => {
    return () => {
      console.log("bye imagelist");
    };
  }, []);
  return (
    <div>
      {files.map((img, idx) => {
        return (
          <div
            key={idx}
            className="flex pt-2  items-center justify-between border-2 border-slate-300 pb-2 pl-1 pr-1 mb-2 rounded"
          >
            <figure>
              <img
                src={img.preview}
                width="200"
                height="100"
                className="shadow border-2 rounded"
              />
              <figcaption className="text-ellipsis overflow-hidden">{img.name}</figcaption>
            </figure>
            <div className="flex flex-col">
              index=={idx + 1}
              {img.isvalidating && (
                <img
                  className="h-4"
                  height="20"
                  width="20"
                  src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Youtube_loading_symbol_1_(wobbly).gif"
                />
              )}
              <p>is it valid ==== {String(img.valid)}</p>
            </div>
            <button
              className="bg-stone-300 pl-2 pr-2 rounded font-bold h-6 disabled:opacity-25"
              disabled={img.isvalidating}
              onClick={() => removeHandler(img)}
            >
              X
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ImageList;
