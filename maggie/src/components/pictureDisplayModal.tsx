import { Box, IconButton, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface PictureDisplayModalProps {
  currentImageUrl: string;
  onClose: () => void;
}
export const PictureDisplayModal = ({
  currentImageUrl,
  onClose,
}: PictureDisplayModalProps) => {
  return (
    <Modal open={!!currentImageUrl} onClose={onClose}>
      <Box
        p={4}
        mx="auto"
        my="20vh"
        width="600px"
        maxHeight="70vh"
        overflow="auto"
        padding="0"
      >
        {/* Box for flex container with justifyContent */}
        <Box display="flex" justifyContent="flex-end" paddingTop="0">
          <IconButton color="error" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <img src={currentImageUrl} alt="product" width="100%" /> {/* eslint-disable-line @next/next/no-img-element */}
      </Box>
    </Modal>
  );
};
