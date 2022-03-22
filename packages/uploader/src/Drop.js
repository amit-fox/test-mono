import React, { useCallback, useState , useRef} from "react";
import { useDropzone } from "react-dropzone";
import {
  validateAllFiles,
  generatePromises,
  prepareImagesPreview,
  removeSelectionForDeletion
} from "./util";
import ImageList from "./ImageList";

const style = {
  height: "10vh",
  background: "#db7c7c",
  padding: "2rem",
  position: "relative",
};

let ds = {
  uuid1: {
    isvalid: true,
    response: true,
    fileData: {},
  },
  uuid2: {
    isvalid: true,
    response: true,
    fileData: {},
  },
  uuid3: {
    isvalid: true,
    response: true,
    fileData: {},
  },
};

function validateIfAllOk(tasks) {
  return tasks.some((task) => task.valid === false);
}
/*
 isValidating
 isvalid
*/
function MyDropzone({ validation }) {

  const counterRef = useRef(0);
  const deleteNodeRef = useRef([]);

  const [files, setFiles] = useState([]);
  const [shouldAllowUpload, setAllowUpload] = useState(false);
  // this will be used only for async validators case
  const [isValidating, setValidating] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      counterRef.current = counterRef.current+1;
      // since custome validator isnt a async
      // and ondrop doesnt wait
      // console.log("starting drop here...acceptedFiles, files>>",acceptedFiles, files);

      // this step may be important to display initial image just after DRAG happens
      const mappedFiles = prepareImagesPreview(acceptedFiles);
      let merge = [...mappedFiles, ...files];
      setFiles([...merge]);

      // if we want to validate it with external api
      if (validation.asyncUri) {
        // for async validation we neek to keep track of status
        setValidating(true);
        // there could be multiple file dropped
        // we need to create promise for all of them to validate
        let requests = generatePromises(mappedFiles, mappedFiles.length);

        // this is a promise all who will capture success/fail both
        // so that we can have both type of status
        await validateAllFiles(requests) // will be used to complete validation for all file selected
          .then((tasks) => {
            console.log("file is ready >>", acceptedFiles, files, tasks);

            // verify it eveytime
            if (validateIfAllOk(tasks)) {
              setAllowUpload(false);
            } else {
              setAllowUpload(true);
            }

            let responseAfterValidation = [...tasks, ...files].map((f) => {
              f.isvalidating = false;
              return f;
            });

            let remainingItems = removeSelectionForDeletion(responseAfterValidation,deleteNodeRef.current, 'id' )
            
            setFiles(
              remainingItems.length
                ? [...remainingItems]
                : [...responseAfterValidation]
            );
          })
          .catch((e) => {
            console.log(e);
          })
          .finally(() => {
            // need to reset once validation completes
            setValidating(false);
          });
          console.log('hey>>>')
      }
    },
    [files]
  );

  const onFileDialogOpen = (e) => {
    console.log("onFileDialogOpen", e);
  };

  const onDropRejected = (e) => {
    // this will not help in case of async validator
    console.log("onDropRejected>>", e);
  };
  // async function validateWithApi() {
  //   console.log('2')
  //   return await sleep().then(data=>{
  //     console.log('5')
  //     return new Promise(resolve =>{
  //       resolve(data)
  //     })
  //   })
  // }
  // async function customValidator(file) {
  //   console.log("1");
  //   // return null
  //   // way0

  //   let data = await fetch("https://jsonplaceholder.typicode.com/todos/1")
  //     console.log("inside validateWithApi ", data);

  //   //way3
  //   var start = new Date().getTime();
  //   while (new Date().getTime() < start + 3000);

  //   console.log("final 6");
  //   // console.log("final 6");

  //   way1
  //   let response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
  //   console.log('customValidator after fetch ',response)
  //   return null

  //   way 2
  //   validateWithApi()
  //   .then(data=>{
  //     console.log('after fetch customValidator>>', data)
  //     return [1]
  //   })
  //   return [1]

  //   way3
  //   var start = new Date().getTime();
  //   while (new Date().getTime() < start + 3000);
  //   return null

  //   way 4
  //   console.log('before callback ')
  //   validateWithApi(function(data){
  //     console.log('callback data', data)
  //     return [1]
  //   })
  //   // console.log('after callback ')

  const {
    getRootProps,
    getInputProps,
    open,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: "image/*",
    maxFiles: 5,
    onDrop: onDrop,
    onFileDialogOpen: onFileDialogOpen,
    onDropRejected,
  });

  const removeFile = (imgId) => {
    let filesCopy = [...files];
    let filteredFiles = filesCopy.filter((file, idx) => {
      return file.id != imgId.id;
    });
    // this will keep track of deleted nodes
    deleteNodeRef.current.push(imgId);
    setFiles(filteredFiles);
    if (validateIfAllOk(files)) {
      setAllowUpload(false);
    } else {
      setAllowUpload(true);
    }
  };
  //console.log('rendering files>>>', files)
  const handleSubmit = () =>{
    console.log('handleSubmit>>>>', files)
  }
  return (
    <div className="p-3">
      <section {...getRootProps()}>
        <div style={style}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop some files here, or click to select files</p>
          )}
        </div>
        <button
          onClick={open}
          disabled={isValidating}
          className=" pl-3 pr-3 pt-2 pb-2  mt-2 bg-blue-500 disabled:opacity-25"
        >
          Add More Files
        </button>
      </section>
      <ImageList files={files} removeHandler={removeFile} />
      {/* {isvalidating && <h1>Validating file... </h1>} */}
      <p>is everything ok ? : {String(shouldAllowUpload)}</p>
      <p>isDragAccept---{String(isDragAccept)}</p>
      <p>isDragReject---{String(isDragReject)}</p>

      <button
        onClick={handleSubmit}
        className="pl-3 pr-3 pt-2 pb-2  mt-2 bg-blue-500 disabled:opacity-25"
        disabled={!shouldAllowUpload || !files.length}
      >
        Upload Now
      </button>
    </div>
  );
}

export default MyDropzone;


