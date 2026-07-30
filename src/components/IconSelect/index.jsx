import { useMemo, useState } from 'react'
import { Input, Popover } from 'antd'
import { CloseCircleFilled, DownOutlined, SearchOutlined } from '@ant-design/icons'
import PropTypes from 'prop-types'
import { ICON_NAMES, MENU_ICONS } from './iconMap'
import './icon-select.css'

/**
 * 菜单图标选择器
 * 触发器展示当前图标预览，弹层内以网格陈列可选图标，支持按名称搜索与一键清空
 */
const IconSelect = ({ value, onChange, placeholder = '请选择菜单图标' }) => {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [keyword, setKeyword] = useState('')

  const filteredNames = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return ICON_NAMES
    return ICON_NAMES.filter((name) => name.toLowerCase().includes(kw))
  }, [keyword])

  const ActiveIcon = value ? MENU_ICONS[value] : null

  const handlePick = (name) => {
    onChange?.(name)
    setPopoverOpen(false)
    setKeyword('')
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange?.(undefined)
  }

  const content = (
    <div className="icon-select-pop">
      <Input
        className="icon-select-search"
        prefix={<SearchOutlined style={{ color: 'var(--text-secondary)' }} />}
        placeholder="搜索图标名称"
        allowClear
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      {filteredNames.length ? (
        <div className="icon-select-grid">
          {filteredNames.map((name) => {
            const Icon = MENU_ICONS[name]
            return (
              <span
                key={name}
                title={name}
                className={`icon-select-item${value === name ? ' selected' : ''}`}
                onClick={() => handlePick(name)}
              >
                <Icon />
              </span>
            )
          })}
        </div>
      ) : (
        <div className="icon-select-empty">未找到匹配的图标</div>
      )}
    </div>
  )

  return (
    <Popover
      content={content}
      trigger="click"
      open={popoverOpen}
      onOpenChange={(open) => {
        setPopoverOpen(open)
        if (!open) setKeyword('')
      }}
      placement="bottomLeft"
      arrow={false}
    >
      <div className={`icon-select-trigger${popoverOpen ? ' active' : ''}`}>
        {ActiveIcon ? (
          <span className="icon-select-value">
            <ActiveIcon />
            <span>{value}</span>
          </span>
        ) : (
          <span className="icon-select-placeholder">{placeholder}</span>
        )}
        {value ? (
          <CloseCircleFilled className="icon-select-clear" onClick={handleClear} />
        ) : (
          <DownOutlined className="icon-select-arrow" />
        )}
      </div>
    </Popover>
  )
}

IconSelect.propTypes = {
  /** 当前图标名称（iconMap 中的 key） */
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
}

export default IconSelect
