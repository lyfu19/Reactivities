import { CloudUpload } from "@mui/icons-material";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import Cropper, { type ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

type Props = {
  uploadPhoto: (file: File) => void;
  loading: boolean;
};

type PreviewItem = {
  file: File;
  preview: string; // URL.createObjectURL(file)
};

export default function PhotoUploadWidget({ uploadPhoto, loading }: Props) {
  const [files, setFiles] = useState<PreviewItem[]>([]);
  const cropperRef = useRef<ReactCropperElement>(null);

  useEffect(() => {
    return () => {
      files.forEach((x) => URL.revokeObjectURL(x.preview));
    };
  }, [files]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const mapped: PreviewItem[] = acceptedFiles.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f), // File is a subclass of Blob
    }));
    setFiles(mapped);
  }, []);

  const onCrop = useCallback(() => {
    const cropper = cropperRef.current?.cropper;
    cropper?.getCroppedCanvas().toBlob((blob) => {
      if (blob) {
        uploadPhoto(blob as File);
      }
    });
  }, [uploadPhoto]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Grid spacing={3} container>
      <Grid size={4}>
        <Typography variant="overline" color="secondary">
          Step 1 Add photo
        </Typography>
        <Box
          {...getRootProps()}
          sx={{
            border: "dashed 3px #eee",
            borderColor: isDragActive ? "green" : "eee",
            borderRadius: "5px",
            pt: "30px",
            textAlign: "center",
            height: "280px",
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 80 }} />
          <Typography variant="h5">Drop image here</Typography>
        </Box>
      </Grid>

      <Grid size={4}>
        <Typography variant="overline" color="secondary">
          Step 2 Resize image
        </Typography>
        {files[0]?.preview && (
          <Cropper
            src={files[0]?.preview}
            style={{ height: 300, width: "90%" }}
            initialAspectRatio={1}
            aspectRatio={1}
            preview=".img-preview"
            guides={false}
            viewMode={1}
            background={false}
            ref={cropperRef}
          />
        )}
      </Grid>

      <Grid size={4}>
        {files[0]?.preview && (
          <>
            <Typography variant="overline" color="secondary">
              Step 3 Preview & Upload
            </Typography>
            <div
              className="img-preview"
              style={{ width: 300, height: 300, overflow: "hidden" }}
            />
            <Button
              sx={{ my: 1, width: 300 }}
              onClick={onCrop}
              variant="contained"
              color="secondary"
              disabled={loading}
            >
              Upload
            </Button>
          </>
        )}
      </Grid>
    </Grid>
  );
}
