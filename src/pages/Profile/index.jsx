import { useState } from 'react'
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
import { uploadAvatar } from '../../api/user'
import { useUserStore } from '../../store/userStore'
import { getStorage, setStorage, STORAGE_KEYS } from '../../utils/storage'
import { formatDateTime, AVATAR_UPDATED_EVENT } from '../../utils/helpers'
import useFileUrl from '../../hooks/useFileUrl'
import InfoForm from './components/InfoForm'
import PasswordForm from './components/PasswordForm'
import './profile.css'

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

  // 头像：旧版存储的 dataURL / 外链直接回显；否则通过 /images/url 获取 MINIO 预签名链接。
  // 链接过期前自动刷新、加载失败自动重取，避免头像裂图
  const stored = getStorage(STORAGE_KEYS.AVATAR)
  const initialUrl =
    stored && (stored.startsWith('data:') || /^https?:\/\//.test(stored)) ? stored : ''
  const { url: avatarUrl, refresh: refreshAvatar, onError: handleAvatarError } = useFileUrl(
    'avatar',
    { initialUrl },
  )

  const displayName = userInfo?.realName || userInfo?.userName || '-'

  /** 头像上传：成功后持久化 fileId，并重新获取带鉴权的 URL 回显新头像 */
  const handleAvatarUpload = ({ file, onProgress, onSuccess, onError }) => {
    setUploading(true)
    setPercent(0)
    uploadAvatar(
      file,
      (p) => {
        setPercent(p)
        onProgress({ percent: p })
      },
    )
      .then(async (result) => {
        const fileId = result?.fileId
        if (!fileId) throw new Error('上传结果缺少 fileId')
        setStorage(STORAGE_KEYS.AVATAR, fileId)
        // 重新获取带鉴权的新链接并追加时间戳，避免浏览器缓存旧头像
        const url = await refreshAvatar(true)
        if (!url) throw new Error('获取头像链接失败')
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
                <Avatar
                  size={96}
                  src={avatarUrl}
                  icon={<UserOutlined />}
                  onError={handleAvatarError}
                >
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
