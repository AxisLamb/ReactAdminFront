import { useEffect, useRef, useState } from 'react'
import { App, Avatar, Card, Col, Row, Tabs, Tag, Upload } from 'antd'
import {
  CameraOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { downloadFileBlob, uploadFile } from '../../api/file'
import { useUserStore } from '../../store/userStore'
import { getStorage, setStorage, STORAGE_KEYS } from '../../utils/storage'
import { formatDateTime, AVATAR_UPDATED_EVENT } from '../../utils/helpers'
import InfoForm from './components/InfoForm'
import PasswordForm from './components/PasswordForm'
import './profile.css'

/** 头像存储值是否为 fileId（排除旧版误存的 dataURL / 外链） */
const isFileId = (v) =>
  typeof v === 'string' && v.length > 0 && !v.startsWith('data:') && !v.startsWith('http')

/**
 * 个人中心
 * 左侧用户卡片（头像 hover 蒙层点击上传，进度百分比实时反馈），
 * 右侧基本信息 / 修改密码两个标签页
 */
const Profile = () => {
  const { message } = App.useApp()
  const userInfo = useUserStore((s) => s.userInfo)
  const [uploading, setUploading] = useState(false)
  const [percent, setPercent] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState('')
  const objectUrlRef = useRef('')

  // 头像以 fileId 持久化；/files 静态路径需鉴权（实测 401），
  // 回显时走 /images/download 拉取文件流并转为 ObjectURL；
  // 旧版存储的 dataURL / 外链直接回显
  useEffect(() => {
    const stored = getStorage(STORAGE_KEYS.AVATAR)
    if (stored && (stored.startsWith('data:') || /^https?:\/\//.test(stored))) {
      setAvatarUrl(stored)
      return undefined
    }
    if (!isFileId(stored)) return undefined
    let active = true
    let url = ''
    downloadFileBlob(stored)
      .then((blob) => {
        if (!active) return
        url = URL.createObjectURL(blob)
        objectUrlRef.current = url
        setAvatarUrl(url)
      })
      .catch((e) => console.error('[Profile] load avatar error:', e))
    return () => {
      active = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [])

  const displayName = userInfo?.realName || userInfo?.userName || '-'

  /** 头像上传：成功后持久化 fileId，并立即下载回显新头像 */
  const handleAvatarUpload = ({ file, onProgress, onSuccess, onError }) => {
    setUploading(true)
    setPercent(0)
    uploadFile(
      file,
      {
        // serviceModule: 'user',
        businessType: 'avatar',
        businessId: String(userInfo?.userId || ''),
      },
      (p) => {
        setPercent(p)
        onProgress({ percent: p })
      },
    )
      .then(async (result) => {
        const fileId = result?.fileId
        if (!fileId) throw new Error('上传结果缺少 fileId')
        setStorage(STORAGE_KEYS.AVATAR, fileId)
        const blob = await downloadFileBlob(fileId)
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
        const url = URL.createObjectURL(blob)
        objectUrlRef.current = url
        setAvatarUrl(url)
        // 通知顶栏 Header 实时刷新头像回显
        window.dispatchEvent(new Event(AVATAR_UPDATED_EVENT))
        onSuccess(result, file)
        message.success('头像已更新')
      })
      .catch((e) => {
        console.error('[Profile] avatar upload error:', e)
        onError(e)
      })
      .finally(() => {
        setUploading(false)
        setPercent(0)
      })
  }

  const metaList = [
    { icon: <MailOutlined />, label: '邮箱', value: userInfo?.email || '未填写' },
    { icon: <PhoneOutlined />, label: '手机号', value: userInfo?.mobile || '未填写' },
    { icon: <IdcardOutlined />, label: '用户ID', value: userInfo?.userId ?? '-' },
    {
      icon: <SafetyCertificateOutlined />,
      label: '账号状态',
      value: userInfo?.status === 1 ? '正常' : '停用',
    },
    { icon: <ClockCircleOutlined />, label: '注册时间', value: formatDateTime(userInfo?.createTime) },
  ]

  return (
    <Row gutter={[16, 16]} className="profile-page">
      {/* 左侧用户卡片 */}
      <Col xs={24} xl={8}>
        <Card className="profile-user-card" bordered={false} styles={{ body: { padding: 0 } }}>
          <div className="profile-user-top">
            <Upload
              showUploadList={false}
              accept="image/*"
              customRequest={handleAvatarUpload}
            >
              <div className="profile-avatar-wrap">
                <Avatar size={96} src={avatarUrl} icon={<UserOutlined />}>
                  {String(displayName).charAt(0).toUpperCase()}
                </Avatar>
                <span className="profile-avatar-mask">
                  {uploading ? (
                    <span className="mask-percent">{percent}%</span>
                  ) : (
                    <>
                      <CameraOutlined />
                      <span>更换头像</span>
                    </>
                  )}
                </span>
              </div>
            </Upload>
            <div className="profile-name">{displayName}</div>
            <div className="profile-username">@{userInfo?.userName || '-'}</div>
            {userInfo?.role?.roleName && (
              <Tag color="blue" className="profile-role">
                {userInfo.role.roleName}
              </Tag>
            )}
            {userInfo?.role?.roleDesc && (
              <div className="profile-role-desc">{userInfo.role.roleDesc}</div>
            )}
          </div>

          <ul className="profile-meta">
            {metaList.map((item) => (
              <li key={item.label}>
                {item.icon}
                <span>{item.label}</span>
                <b>{item.value}</b>
              </li>
            ))}
          </ul>
        </Card>
      </Col>

      {/* 右侧信息 / 密码标签页 */}
      <Col xs={24} xl={16}>
        <Card className="profile-tabs-card" bordered={false}>
          <Tabs
            destroyInactiveTabPane
            items={[
              {
                key: 'info',
                label: (
                  <span>
                    <UserOutlined />
                    基本信息
                  </span>
                ),
                children: <InfoForm />,
              },
              {
                key: 'password',
                label: (
                  <span>
                    <LockOutlined />
                    修改密码
                  </span>
                ),
                children: <PasswordForm />,
              },
            ]}
          />
        </Card>
      </Col>
    </Row>
  )
}

export default Profile
