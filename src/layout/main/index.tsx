import { FC } from 'react'
import ActionPanel from './ActionPanel'
import DataTable from './DataTable'
import LoggerPanel from './LoggerPanel'
import QuickPanel from './QuickPanel'
import { Layout } from 'antd'
import './index.scss'

const { Header, Sider, Content: AntContent, Footer } = Layout

interface IProps {}

const baseCls = 'entrance'
const Content: FC<IProps> = (props) => {
  return (<div className={baseCls}>
    <Layout className={`${baseCls}-layout`}>
      <Layout className={`${baseCls}-layout-inner`}>
        <Sider className={`${baseCls}-layout-inner-sider`} collapsible={false} width={200}>
          <ActionPanel />
          <QuickPanel />
        </Sider>
        <AntContent className={`${baseCls}-layout-inner-content`}>
          <DataTable />
        </AntContent>
      </Layout>
      <Footer className={`${baseCls}-layout-footer`}>
        <LoggerPanel />
      </Footer>
    </Layout>
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as Entrance }
export type { IProps as EntranceProps }