
import { useState } from 'react';
import './App.css';
import S3Uploader from './S3Uploader';


//const uuid=require('uuid');

function App() {
  const[image,setImage]=useState('');
  const[uploadResultMessage,setuploadResultMessage]=useState('Please upload an image to authenticate.');
  const[vistiorName,setvisitorName]= useState('placeholder.png');
  const[auth,setAuth]=useState(false);
  const[page,setPage]=useState(false);

  function sendImage(e){
    e.preventDefault();
    setvisitorName(image.name);
   // const visitorImageName=uuid.v4();
    const visitorImageName=image.name;
    fetch(`https://555n4l4pub.execute-api.us-east-1.amazonaws.com/dev/employeevisitorscheckingproject/${visitorImageName}`,{
      method: 'PUT',
      headers:{
        'Content-Type':'image/jpg',
        'Content-Type':'image/jpeg'
      },
      body:image
    }).then(async()=>{
      const response=await authenticate(visitorImageName);
      if(response.Message==='Success')
      {
        setAuth(true);
        setuploadResultMessage(`Hi ${response['firstName']} ${response['lastName']}, your an existing employee !!!`)
      }
      else{
        setAuth(false);
        setuploadResultMessage('Authentication Failed: This person is not an Employee')
      }
    }).catch(error=>{
      setAuth(false);
      setuploadResultMessage('This while Authentication Process. Try again.')
      console.error(error);
    })

  }

  async function authenticate(visitorImageName){
    const requestUrl='https://555n4l4pub.execute-api.us-east-1.amazonaws.com/dev/employee?'+new URLSearchParams({
      objectKey: `${visitorImageName}`
    });
    return await fetch(requestUrl,{
      method:'GET',
      headers:{
        'Accept':'application/json',
        'Content-Type':'application/json'
      }  
    }).then(response=>response.json())
    .then((data)=>{
      return data;
    }).catch(error=>console.error(error));
  }

  return (
    <div className="App">
      {page?(<S3Uploader/>):(
        <div>

        <h2>Facial Recogniton App</h2>
      <form onSubmit={sendImage}>
        <input type='file' name='image' onChange={e=> setImage(e.target.files[0])}/>
        <button type='submit'>Authenticate</button>
      </form>
      <button type='submit' onClick={()=>setPage(true)} >Register</button>

      <div className={auth?'Success':'failure'}>{uploadResultMessage}</div>
      <img src={require(`./visitors/${vistiorName}`)} alt="Visitor" height={250} width={250}/>
        </div>
      )}
    </div>
  );
}

export default App;
