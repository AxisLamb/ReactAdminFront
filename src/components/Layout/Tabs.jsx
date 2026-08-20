import { Tabs as AntTabs, Dropdown, Button } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTabStore } from '@/store/tabStore'

/**
 * 多标签栏
 * - 芯片式标签，点击切换，可关闭（首页固定）
 * - 右键菜单：关闭当前 / 关闭其他 / 关闭全部
 * - 右侧刷新当前页按钮
 */
function Tabs() {
  const navigate = useNavigate()
  const tabs = useTabStore((s) => s.tabs)
  const activeKey = useTabStore((s) => s.activeKey)
  const setActive = useTabStore((s) => s.setActive)
  const removeTab = useTabStore((s) => s.removeTab)
  const removeOtherTabs = useTabStore((s) => s.removeOtherTabs)
  const removeAllTabs = useTabStore((s) => s.removeAllTabs)
  const refreshTab = useTabStore((s) => s.refreshTab)

  const handleChange = (key) => {
    setActive(key)
    navigate(key)
  }

  const handleEdit = (key, action) => {
    if (action === 'remove') {
      const next = removeTab(key)
      if (next) navigate(next)
    }
  }

  // 标签右键菜单
  const buildContextMenu = (key, closable) => ({
    items: [
      { key: 'close', label: '关闭当前', disabled: !closable },
      { key: 'closeOther', label: '关闭其他' },
      { key: 'closeAll', label: '关闭全部' },
    ],
    onClick: ({ key: action }) => {
      if (action === 'close') {
        const next = removeTab(key)
        if (next) navigate(next)
      } else if (action === 'closeOther') {
        removeOtherTabs(key)
        setActive(key)
        navigate(key)
      } else if (action === 'closeAll') {
        removeAllTabs()
        navigate('/dashboard')
      }
    },
  })

  const items = tabs.map((tab) => ({
    key: tab.key,
    closable: tab.closable,
    label: (
      <Dropdown
        menu={buildContextMenu(tab.key, tab.closable)}
        trigger={['contextMenu']}
      >
        <span className="tab-label">{tab.title}</span>
      </Dropdown>
    ),
  }))

  return (
    <div className="app-tabs">
      <AntTabs
        type="editable-card"
        hideAdd
        size="small"
        activeKey={activeKey}
        onChange={handleChange}
        onEdit={handleEdit}
        items={items}
        tabBarExtraContent={
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            className="tab-refresh"
            onClick={() => refreshTab(activeKey)}
            title="刷新当前页"
          />
        }
      />
    </div>
  )
}

export default Tabs
