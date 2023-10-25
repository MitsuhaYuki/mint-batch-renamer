import { Accessory } from './Accessory'
import { BaseConfig } from './BaseConfig'
import { DetailPanel } from './DetailPanel'
import { FC } from 'react'
import { Flex, Layout } from 'antd'
import { MultiLangProps } from '@/types/mlang'
import { TaskFlow } from './TaskFlow'
import { fmlNameMaker } from '@/utils/mlang'
import { useConfigContext } from '@/context/config'
import './index.scss'

interface IProps extends MultiLangProps {}

const baseCls = 'entrance'
const Content: FC<IProps> = (props) => {
  const [config, setConfig] = useConfigContext()
  return (<div className={baseCls}>
    <Layout className={`${baseCls}-layout`}>
      <Layout.Sider width='220px'>
        <Flex className={`${baseCls}-sider-flex`} vertical>
          <Flex flex='0 0 auto'>
            <BaseConfig />
          </Flex>
          <Flex flex='1 1 auto' style={{ overflow: 'auto' }}>
            <TaskFlow />
          </Flex>
          <Accessory inheritName={fmlNameMaker(baseCls, props.inheritName)} />
        </Flex>
      </Layout.Sider>
      <Layout.Content>
        <DetailPanel />
      </Layout.Content>
    </Layout>
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as Entrance }
export type { IProps as EntranceProps }