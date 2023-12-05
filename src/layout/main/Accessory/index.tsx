import { AboutModal } from '@/components/QuickModal/About'
import { Badge, Button, Flex } from 'antd'
import { Console, ConsoleRef } from '../Console'
import { DevModal } from '@/components/QuickModal/Dev'
import { FC, ReactElement, cloneElement, useCallback, useMemo, useRef } from 'react'
import { InboxOutlined, InfoCircleOutlined, SettingOutlined } from '@ant-design/icons'
import { MultiLangProps } from '@/types/mlang'
import { QuickModalRef } from '@/components/QuickModal/Base'
import { SettingsModal } from '@/components/QuickModal/Setting'
import { useConfigContext } from '@/context/config'
import { useKeyPress } from 'ahooks'
import { useWrappedLogger } from '@/utils/logger'
import { useMultiLang } from '@/utils/mlang'
import './index.scss'

type IAccessoryBtns = {
  badge?: number | 'dot'
  badgeColor?: string
  hidden?: boolean
  icon: ReactElement
  name: string
  onClick: () => void
}

interface IProps extends MultiLangProps {}

const baseCls = 'accessory'
const Content: FC<IProps> = (props) => {
  const [config] = useConfigContext()
  const con = useWrappedLogger()
  const { fmlName, fmlText } = useMultiLang(config, baseCls, props.inheritName)

  // Modal Controllers
  const conRef = useRef<ConsoleRef>(null)
  const amRef = useRef<QuickModalRef>(null)
  const devRef = useRef<QuickModalRef>(null)
  const smRef = useRef<QuickModalRef>(null)

  // dev panel access method
  useKeyPress(['ctrl.f12'], () => {
    con.logger.warn('Open dev panel')
    devRef.current?.toggle(true)
  }, {
    exactMatch: true,
  })

  const renderAccessoryButtons = useCallback((btns: IAccessoryBtns[]) => btns.map((v, k) => (
    <Badge
      classNames={{ indicator: `${baseCls}-badge` }}
      color={v.badgeColor}
      count={v.badge}
      dot={v.badge === 'dot'}
      key={k}
      offset={[-5, 5]}
      overflowCount={99}
      size='small'
      title={v.name}
    >
      <Button
        icon={cloneElement(v.icon, {
          className: `${baseCls}-icon`,
          style: { color: '#8c8c8c' },
          title: v.name,
        })}
        shape='circle'
        title={v.name}
        type='text'
        onClick={v.onClick}
      />
    </Badge>
  )), [])

  const accessoryBtns = useMemo(() => renderAccessoryButtons([
    {
      name: fmlText('logs'),
      badge: con.logs.length > 1 ? con.logs.length : undefined,
      badgeColor: '#d9d9d9',
      icon: <InboxOutlined />,
      onClick: () => conRef.current?.toggle(true),
    },
    {
      name: fmlText('settings'),
      icon: <SettingOutlined />,
      onClick: () => smRef.current?.toggle(true),
    },
    {
      name: fmlText('settings'),
      icon: <InfoCircleOutlined />,
      onClick: () => amRef.current?.toggle(true),
    },
  ]), [con.logs])

  return (<div className={baseCls}>
    <Flex className={`${baseCls}-flex`} justify='space-evenly'>
      {accessoryBtns}
    </Flex>
    <AboutModal ref={amRef} inheritName={fmlName} />
    <DevModal ref={devRef} />
    <SettingsModal ref={smRef} inheritName={fmlName} />
    <Console
      ref={conRef}
      inheritName={fmlName}
      config={config}
      console={con}
    />
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as Accessory }
export type { IProps as AccessoryProps }