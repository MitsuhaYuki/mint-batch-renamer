import type { TableProps } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { ConfigProvider, Table, theme } from 'antd'
import { useRef } from 'react'
import { useSize } from 'ahooks'
import './index.scss'

export interface VirtualTableProps<RecordType> extends Omit<TableProps<RecordType>, 'pagination' | 'scroll' | 'size'> {
  columns?: ColumnsType<RecordType>
  scroll?: { x?: number, y?: number }
}

const baseCls = 'virtual-table'
export const VirtualTable = <RecordType extends object> (props: VirtualTableProps<RecordType>) => {
  const { scroll, ...restProps } = props
  const wrapperRef = useRef<HTMLDivElement>(null)
  const wrapperSize = useSize(wrapperRef)
  const scrollArea = {
    x: scroll?.x ?? wrapperSize?.width ?? 0,
    y: scroll?.y ?? wrapperSize?.height ?? 0,
  }

  return (
    <div className={baseCls} ref={wrapperRef}>
      <ConfigProvider theme={{ components: { Table: { cellFontSizeMD: 12 } } }}>
        <Table
          virtual
          className={`${baseCls}-inner`}
          {...restProps}
          pagination={false}
          scroll={scrollArea}
          size='middle'
        />
      </ConfigProvider>
    </div>
  )
}
