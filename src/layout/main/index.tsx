import { Accessory } from './Accessory'
import { BaseConfig } from './BaseConfig'
import { DetailPanel } from './DetailPanel'
import { FC } from 'react'
import { Flex, Layout } from 'antd'
import { MultiLangProps } from '@/types/mlang'
import { TaskFlow } from './TaskFlow'
import { fmlNameMaker } from '@/utils/mlang'
import './index.scss'

interface IProps extends MultiLangProps {}

const baseCls = 'entrance'
const Content: FC<IProps> = (props) => {
  const fmlName = fmlNameMaker(baseCls, props.inheritName)
  return (<div className={baseCls}>
    <Layout className={`${baseCls}-layout`}>
      <Layout.Sider width='220px'>
        <Flex className={`${baseCls}-sider-flex`} vertical>
          <Flex flex='0 0 auto'>
            <BaseConfig inheritName={fmlName} />
          </Flex>
          <Flex flex='1 1 auto' style={{ overflow: 'auto' }}>
            <TaskFlow inheritName={fmlName} />
          </Flex>
          <Accessory inheritName={fmlName} />
        </Flex>
      </Layout.Sider>
      <Layout.Content>
        <DetailPanel inheritName={fmlName} />
      </Layout.Content>
    </Layout>
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as Entrance }
export type { IProps as EntranceProps }