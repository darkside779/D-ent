import React from 'react';
import { Box, Tooltip, SvgIconProps } from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  TableChart as CsvIcon,
  Article as TxtIcon,
  Folder as FolderIcon,
  Code as CodeIcon
} from '@mui/icons-material';

interface FileTypeProps {
  type: string;
  size?: 'small' | 'medium' | 'large';
}

const iconMap: Record<string, React.ReactNode> = {
  // Documents
  'pdf': <PdfIcon color="error" />,
  'doc': <DocIcon color="primary" />,
  'docx': <DocIcon color="primary" />,
  'txt': <TxtIcon />,
  'rtf': <TxtIcon />,
  'odt': <DocIcon />,
  
  // Spreadsheets
  'xls': <CsvIcon color="success" />,
  'xlsx': <CsvIcon color="success" />,
  'csv': <CsvIcon color="success" />,
  'ods': <CsvIcon />,
  
  // Images
  'jpg': <ImageIcon color="primary" />,
  'jpeg': <ImageIcon color="primary" />,
  'png': <ImageIcon color="primary" />,
  'gif': <ImageIcon color="primary" />,
  'svg': <ImageIcon color="primary" />,
  'bmp': <ImageIcon />,
  'webp': <ImageIcon />,
  
  // Code
  'js': <CodeIcon color="warning" />,
  'jsx': <CodeIcon color="warning" />,
  'ts': <CodeIcon color="info" />,
  'tsx': <CodeIcon color="info" />,
  'json': <CodeIcon />,
  'html': <CodeIcon />,
  'css': <CodeIcon />,
  'py': <CodeIcon />,
  'java': <CodeIcon />,
  'c': <CodeIcon />,
  'cpp': <CodeIcon />,
  'cs': <CodeIcon />,
  'php': <CodeIcon />,
  'rb': <CodeIcon />,
  'go': <CodeIcon />,
  'rs': <CodeIcon />,
  'swift': <CodeIcon />,
  'kt': <CodeIcon />,
  'dart': <CodeIcon />,
  
  // Default
  'folder': <FolderIcon />,
  'default': <FileIcon />
};

const sizeMap = {
  small: 24,
  medium: 32,
  large: 48
};

const FileType: React.FC<FileTypeProps> = ({ type, size = 'medium' }) => {
  const fileType = type?.toLowerCase() || 'default';
  const icon = iconMap[fileType] || iconMap.default;
  const iconSize = sizeMap[size];

  return (
    <Tooltip title={type ? `.${type.toUpperCase()}` : 'File'} arrow>
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        {React.cloneElement(icon as React.ReactElement<SvgIconProps>, {
          sx: { fontSize: iconSize, width: iconSize, height: iconSize }
        })}
      </Box>
    </Tooltip>
  );
};

export default FileType;
