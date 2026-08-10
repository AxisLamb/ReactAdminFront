import { Descriptions, Tag } from 'antd'
import { useUserStore } from '../../../store/userStore'
import { formatDateTime } from '../../../utils/helpers'

/**
 * 基本信息（只读）
 * 个人信息暂不支持在线修改，此处仅展示 /sys/user/info 返回的资料
 */
const InfoForm = () => {
  const userInfo = useUserStore((s) => s.userInfo)
  const role = userInfo?.role

  return (
    <div className="profile-form">
      <Descriptions bordered column={1} labelStyle={{ width: 110 }}>
        <Descriptions.Item label="用户名">{userInfo?.userName || '-'}</Descriptions.Item>
        <Descriptions.Item label="真实姓名">{userInfo?.realName || '-'}</Descriptions.Item>
        <Descriptions.Item label="邮箱">{userInfo?.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="手机号">{userInfo?.mobile || '-'}</Descriptions.Item>
        <Descriptions.Item label="角色">{role?.roleName || '-'}</Descriptions.Item>
        <Descriptions.Item label="账号状态">
          {userInfo?.status === 1 ? <Tag color="success">正常</Tag> : <Tag>停用</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="注册时间">
          {formatDateTime(userInfo?.createTime) || '-'}
        </Descriptions.Item>
      </Descriptions>
      <p className="profile-form-tip">个人信息暂不支持在线修改，如需变更请联系管理员。</p>
    </div>
  )
}

export default InfoForm
