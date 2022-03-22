
import { v4 as uuidv4 } from "uuid";
const promiseGenFail = (data) => {
    return new Promise((resolve, reject) => {
        setTimeout(()=>{
            reject({
                ...data,
                isvalidating:false,
                valid:false,
                error:'this is an sample file error'
            })
          },2000)
    })
}
const promiseGenPass = (data) =>{
    return new Promise((resolve, reject) => {
        setTimeout(()=>{
            resolve({
                ...data,
                file:data,
                isvalidating: false,
                error:null
            })
          },3000)
    })
}
export const generatePromises = (file, n) => {
    let promises = [];
    for(let i=0;i<n;i++){
      promises.push(
        promiseGenPass(file[i]),
      )
    }
    //promises.push(promiseGenFail(data[0]));
    return promises;
}


export const validateAllFiles = (promiseArr) => {
    let output = [];
    let completed = 0;
    let transformed = promiseArr.map(p=>{
        return p.then(data =>{
            return data;
        }).catch(e=>{
            return e;
        })
    })
    
    return new Promise((resolve, reject)=>{
        transformed.forEach((p,index)=>{
            p.then(data =>{
                completed++;
                output[index] = data;

                if(completed == promiseArr.length){
                    resolve(output);
                }
            }).catch(e =>{
                completed++;
                output[index] = e;
                if(completed == promiseArr.length){
                    resolve(output);
                }
            })
        })
        console.log('output',output)
    })
}

export const removeSelectionForDeletion = (arr1, arr2, key) => {
    let remainingItems = [];

    for(let i=0;i<arr1.length;i++){
        let found = false;
        for(let j=0;j<arr2.length;j++){
          if (arr1[i][key] == arr2[j][key]) {
            found = true;
            break;
          }
        }
        if(!found){
          remainingItems.push(arr1[i]);
        }
      }
      return remainingItems;
}
export const prepareImagesPreview = (files, fileType="images/*")=>{
    return files.map((file) =>
        Object.assign(file, {
            id: uuidv4(),
            isvalidating: true,
            valid: true,
            preview: URL.createObjectURL(file),
        })
    );
}

/// extra
const getPromises = (n) => {
    let promises = [];
    for (let i = 0; i < n; i++) {
      promises.push(
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ data: "hello", success: true });
          }, 3000);
        })
      );
    }
  };

  const validateFile = () => {
    console.log("3");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: "hello", success: true });
      }, 3000);
    });
  };