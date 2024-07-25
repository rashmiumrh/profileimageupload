import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import AvatarEditor from "react-avatar-editor";
import "../css/imageuploader.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCloudUploadAlt } from "react-icons/fa";
import { Modal, Button, ProgressBar } from "react-bootstrap";
import Swal from "sweetalert2";

const Image = () => {
  const defaultAvatar =
    "https://i3.wp.com/static.vecteezy.com/system/resources/previews/036/280/651/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg?ssl=1";
  const [image, setImage] = useState(
    localStorage.getItem("profileImage") || defaultAvatar
  );
  const [newImages, setNewImages] = useState([]);
  const [editor, setEditor] = useState(null);
  const [scale, setScale] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Only image files are accepted.",
        });
        return;
      }

      const invalidFiles = acceptedFiles.filter(
        (file) => !file.type.startsWith("image/")
      );
      if (invalidFiles.length > 0) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Only image files are accepted.",
        });
        return;
      }
      const sizeLimit = 5 * 1024 * 1024; // 5MB
      const oversizedFiles = acceptedFiles.filter(
        (file) => file.size > sizeLimit
      );
      if (oversizedFiles.length > 0) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "This image is larger than 5MB. Please select a smaller image.",
        });
        return;
      }

      if (acceptedFiles.length + newImages.length > 5) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "You can only upload up to 5 images.",
        });
        return;
      }

      const files = acceptedFiles.map((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setNewImages((prevImages) => [...prevImages, reader.result]);
        };
        reader.readAsDataURL(file);
        return file;
      });

      setShowUploadModal(true);
    },
    [newImages]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: true,
  });

  const handleScale = (e) => {
    const scale = parseFloat(e.target.value);
    setScale(scale);
  };

  const handleSave = (action) => {
    if (selectedImageIndex !== null && editor) {
      setLoading(true);
      let percent = 0;
      const interval = setInterval(() => {
        percent += 10;
        setProgress(percent);
        if (percent >= 100) {
          clearInterval(interval);
          const canvas = editor.getImageScaledToCanvas().toDataURL();
          setImage(canvas);
          localStorage.setItem("profileImage", canvas);
          setNewImages([]);
          setShowUploadModal(false);
          Swal.fire({
            icon: "success",
            title:
              action === "confirm"
                ? "Profile picture uploaded successfully."
                : "Profile details updated successfully.",
            showConfirmButton: true,
          });
          setLoading(false);
        }
      }, 200);
    } else {
      setShowUploadModal(true);
    }
  };

  const handleRemove = () => {
    setImage(defaultAvatar);
    localStorage.removeItem("profileImage");
    setNewImages([]);
    setEditor(null);
    setShowUploadModal(false);
    Swal.fire({
      icon: "success",
      title: "Profile picture removed.",
    });
  };

  const handleCancel = () => {
    setNewImages([]);
    setSelectedImageIndex(null);
    setShowUploadModal(false);
  };

  const handleImageSelect = (index) => {
    setSelectedImageIndex(index);
  };

  return (
    <div className="card-container">
      <div className="profile-card">
        <div className="profile-banner">
          <div
            className="profile-image-container"
            onClick={() => setShowUploadModal(true)}
          >
            <img src={image} alt="Profile" className="profile-image" />
          </div>
        </div>

        <div className="profile-info">
          <div className="profile-details">
            <h1>Rashmi U</h1>
            <p>
              FrontEnd React.js Developer | Ex Ezatlas Pvt Ltd |
              <span className="pronouns">She/Her</span>
            </p>
          </div>
          <button
            className="btn btn-primary update-button"
            onClick={() => handleSave("update")}
            disabled={loading}
          >
            Update Picture
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal show={showUploadModal} onHide={handleCancel} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>You may upload up to 5 images</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-content">
            <div className="image-uploader">
              <div {...getRootProps({ className: "dropzone" })}>
                <input {...getInputProps()} />
                <FaCloudUploadAlt size={50} />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </div>
              <div className="uploaded-images">
                {newImages.length > 0 &&
                  newImages.map((img, index) => (
                    <div
                      key={index}
                      className={`uploaded-image ${
                        selectedImageIndex === index ? "selected" : ""
                      }`}
                      onClick={() => handleImageSelect(index)}
                    >
                      <img src={img} alt={`Preview ${index}`} />
                    </div>
                  ))}
              </div>
            </div>
            {selectedImageIndex !== null && newImages[selectedImageIndex] && (
              <div className="editor-container">
                <AvatarEditor
                  ref={setEditor}
                  image={newImages[selectedImageIndex]}
                  width={150}
                  height={150}
                  border={50}
                  color={[255, 255, 255, 0.6]}
                  scale={scale}
                  rotate={0}
                  borderRadius={150}
                />
                <div className="scale-slider">
                  <label htmlFor="scale">Zoom In:</label>
                  <input
                    id="scale"
                    type="range"
                    step="0.1"
                    min="1"
                    max="2"
                    value={scale}
                    onChange={handleScale}
                  />
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="cancel" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          {selectedImageIndex !== null && newImages[selectedImageIndex] && (
            <Button
              variant="primary"
              onClick={() => handleSave("confirm")}
              disabled={loading}
            >
              {loading ? "Saving..." : "Confirm"}
            </Button>
          )}
          <Button variant="danger" onClick={handleRemove}>
            Remove Profile
          </Button>
        </Modal.Footer>
        {loading && (
          <div className="loading-container">
            <ProgressBar now={progress} label={`${progress}%`} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Image;
