import { FC } from 'react'
import ActionPanel from './ActionPanel'
import DataTable from './DataTable'
import LoggerPanel from './LoggerPanel'
import QuickPanel from './QuickPanel'
import { Layout } from 'antd'
import './index.scss'

const { Header, Sider, Content, Footer } = Layout

const baseCls = 'entrance'
const EntrancePage: FC = () => {
  return (<div className={baseCls}>
    <Layout className={`${baseCls}-layout`}>
      <Layout className={`${baseCls}-layout-inner`}>
        <Sider className={`${baseCls}-layout-inner-sider`} collapsible={false} width={200}>
          <ActionPanel />
          <QuickPanel />
        </Sider>
        <Content className={`${baseCls}-layout-inner-content`}>
          <DataTable />
        </Content>
      </Layout>
      <Footer className={`${baseCls}-layout-footer`}>
        <LoggerPanel />
      </Footer>
    </Layout>
  </div>)
}

EntrancePage.defaultProps = {}
EntrancePage.displayName = baseCls
export default EntrancePage