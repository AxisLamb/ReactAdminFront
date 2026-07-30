import { useState } from 'react'
import { App, Avatar, Card, Col, Row, Tabs, Tag, Upload } from 'antd'
import {
  CameraOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { uploadFile } from '../../api/file'
import { useUserStore } from '../../store/userStore'
import { getStorage, setStorage, STORAGE_KEYS } from '../../utils/storage'
import { formatDateTime } from '../../utils/helpers'
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
  const setUserInfo = useUserStore((s) => s.setUserInfo)
  const [uploading, setUploading] = useState(false)
  const [percent, setPercent] = useState(0)

  const avatarUrl = getStorage(STORAGE_KEYS.AVATAR) || userInfo?.avatar
  const displayName = userInfo?.realName || userInfo?.username || '-'

  /** 头像上传：成功后写入本地存储并同步全局用户信息 */
  const handleAvatarUpload = ({ file, onProgress, onSuccess, onError }) => {
    setUploading(true)
    setPercent(0)
    uploadFile(file, {
      serviceModule: 'user',
      businessType: 'avatar',
      businessId: String(userInfo?.userId || ''),
      onProgress: (p) => {
        setPercent(p)
        onProgress({ percent: p })
      },
    })
      .then((url) => {
        onSuccess(url, file)
        setStorage(STORAGE_KEYS.AVATAR, url)
        if (userInfo) setUserInfo({ ...userInfo, avatar: url })
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
            <div className="profile-username">@{userInfo?.username}</div>
            {userInfo?.role?.roleName && (
              <Tag color="blue" className="profile-role">
                {userInfo.role.roleName}
              </Tag>
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
