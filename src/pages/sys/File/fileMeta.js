import {
  FileExcelOutlined,
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  FilePptOutlined,
  FileTextOutlined,
  FileWordOutlined,
  FileZipOutlined,
  PlaySquareOutlined,
} from '@ant-design/icons'

/** 扩展名分组 → 图标与主题色 */
const EXT_GROUPS = [
  { exts: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'], icon: FileImageOutlined, color: '#52C41A' },
  { exts: ['pdf'], icon: FilePdfOutlined, color: '#F5222D' },
  { exts: ['doc', 'docx'], icon: FileWordOutlined, color: '#2F54EB' },
  { exts: ['xls', 'xlsx', 'csv'], icon: FileExcelOutlined, color: '#13C2C2' },
  { exts: ['ppt', 'pptx'], icon: FilePptOutlined, color: '#FA8C16' },
  { exts: ['zip', 'rar', '7z', 'tar', 'gz'], icon: FileZipOutlined, color: '#722ED1' },
  { exts: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'], icon: PlaySquareOutlined, color: '#EB2F96' },
  { exts: ['txt', 'md', 'log'], icon: FileTextOutlined, color: '#8C8C8C' },
]

/** 提取文件扩展名（小写、不含点） */
export const getFileExt = (name) => {
  const idx = String(name || '').lastIndexOf('.')
  return idx > -1 ? String(name).slice(idx + 1).toLowerCase() : ''
}

/**
 * 根据文件名返回展示元信息
 * @returns {{ icon: React.ComponentType, color: string }}
 */
export const getFileMeta = (name) => {
  const ext = getFileExt(name)
  const group = EXT_GROUPS.find((g) => g.exts.includes(ext))
  return group ? { icon: group.icon, color: group.color } : { icon: FileOutlined, color: '#8C8C8C' }
}
