import React from 'react';
import AWS from 'aws-sdk';
import Webcam from 'react-webcam';
import { useFormik } from "formik";

class S3Uploader extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      uploadInProgress: false,
    };
    this.name = "";
    this.s3 = new AWS.S3({
      // Your AWS S3 configuration
      accessKeyId: '',
      secretAccessKey: '',
      region: '',
    });
  }
    // formik = useFormik({
    //   initialValues: {
    //     name:"",
    //   },
    // });

  handleFileChange = (event) => {
    this.setState({
      selectedFile: event.target.files[0],
    });
  };

  captureImageFromWebcam = () => {
    const imageSrc = this.webcamRef.getScreenshot();
    this.setState({ selectedFile: imageSrc });
    this.handleUpload()
  };

 

  handleUpload = () => {
    const { selectedFile } = this.state;
    if (!selectedFile) return;

    this.setState({ uploadInProgress: true });

    // Convert base64 image to a Blob
    const blob = new Blob([selectedFile], { type: 'image/jpeg' });

    const params = {
      Bucket: 'employeeregistrationproject',
      Key: `webcam${this.name}.jpeg`,
      Body: blob,
      ACL: 'public-read'
    };

    this.s3.upload(params, (err, data) => {
      if (err) {
        console.error('Error uploading file:', err);
        this.setState({ uploadInProgress: false });
      }else {
        console.log('File uploaded successfully. Object URL:', data.Location);
        this.setState({ uploadInProgress: false, imageUrl: data.Location }, () => {
          // Trigger download after successful upload
          this.handleDownload();
        });
      }
    });
  };
  // handleUpload = () => {
  //   const { selectedFile } = this.state;
  //   if (!selectedFile) return;
  
  //   this.setState({ uploadInProgress: true });
  
  //   // Convert base64 image to a Blob
  //   const blob = new Blob([selectedFile], { type: 'image/jpeg' });
  
  //   const params = {
  //     Bucket: 'employeeregistrationproject',
  //     Key: `webcam_${this.name}.jpeg`,
  //     Body: blob,
  //     ACL: 'public-read'
  //   };
  
  //   this.s3.upload(params, (err, data) => {
  //     if (err) {
  //       console.error('Error uploading file:', err);
  //       this.setState({ uploadInProgress: false });
  //     } else {
  //       console.log('File uploaded successfully. Object URL:', data.Location);
  //       this.setState({ uploadInProgress: false, imageUrl: data.Location }, () => {
  //         // Trigger download after successful upload
  //         this.handleDownload();
  //       });
  //     }
  //   });
  // };
  handleDownload = () => {
    const { imageUrl } = this.state;
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.setAttribute('download', `webcam_${this.name}.jpeg`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

  render() {
    const { uploadInProgress } = this.state;
    const call = (e)=>{
      this.name = e.target.value
    }

    return (
        
            <div>
              <Webcam
                audio={false}
                ref={(webcam) => (this.webcamRef = webcam)} // Store webcam reference
                screenshotFormat="image/jpeg"
              />
              <button onClick={this.captureImageFromWebcam}onChange={this.handleFileChange}>Capture</button>
              <input type="file" onChange={this.handleFileChange} />
              <input type='text' name='name' onChange={call} />
              <button type='submit'>Submit</button>
              
              <button onClick={this.handleUpload} disabled={uploadInProgress}>
                Upload
              </button>
              {uploadInProgress && <p>Uploading...</p>}
            </div>
          );
        }
}

export default S3Uploader;