import React from "react";
import { useDropzone } from "react-dropzone";
import { validateAllFiles } from "../util";

function Plugin(props) {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    getFilesFromEvent: (event) => myCustomFileGetter(event),
  });

  const files = acceptedFiles.map((f) => (
    <li key={f.name}>
      {/* <img src={f.preview} width="100" style={{ border: "1px solid red" }} /> */}
      {JSON.stringify(f)}
    </li>
  ));

  return (
    <section className="container">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>{files}</ul>
      </aside>
    </section>
  );
}

async function myCustomFileGetter(event) {
  const files = [];
  const fileList = event.dataTransfer ? event.dataTransfer.files : event; //.target.files;

  for (var i = 0; i < fileList.length; i++) {
    const file = fileList[i].getFile();
    // Object.defineProperty(file, "myProp", {
    //   preview: URL.createObjectURL(file),
    // });
    files.push(file);
  }

  return files;
  return validateAllFiles(files).then((data) => {
    const mappedFiles = data.map((file) =>
      Object.assign(file, {
        isvalidating: true,
        valid: true,
        preview: URL.createObjectURL(data),
      })
    );
    return mappedFiles
    return files;
  }).catch(e=>{
      console.log(e)
  })
}

export default Plugin;
