import type { ColumnsType } from 'antd/es/table'
import useGlobalData from '@/utils/hooks/useGlobalData'
import { FC, useCallback, useMemo, useRef } from 'react'
import { IFileItem } from '@/types/file'
import { Table } from 'antd'
import './index.scss'

export type ContentProps = {
  example?: any
}
const baseCls = 'data-table'
const Content: FC<ContentProps> = (props) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { globalData, setGlobalData } = useGlobalData()

  // auto format file size with suffix KB, MB, GB, TB
  const formatFileSize = useCallback((size: number) => {
    if (size < 1024) return `${size} B`
    if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`
    if (size < 1073741824) return `${(size / 1048576).toFixed(2)} MB`
    if (size < 1099511627776) return `${(size / 1073741824).toFixed(2)} GB`
    return `${(size / 1099511627776).toFixed(2)} TB`
  }, [])

  const columns = useMemo(() => {
    const resColumns: ColumnsType<IFileItem> = [
      {
        title: '文件名',
        dataIndex: 'name',
        width: 200,
        ellipsis: true,
      },
      {
        title: '大小',
        dataIndex: 'size',
        width: 80,
        ellipsis: true,
        render: (size: number) => formatFileSize(size),
      },
      {
        title: '拓展名',
        dataIndex: 'extension',
        width: 50,
        ellipsis: true
      },
      {
        title: '路径',
        dataIndex: 'path',
        ellipsis: true,
      },
    ]

    if (globalData.filesRenamed) {
      resColumns.splice(0, 3, {
        title: '原文件名',
        dataIndex: 'full_name',
        width: 200,
        ellipsis: false,
      }, {
        title: '重命名后',
        dataIndex: 'rename_full_name',
        width: 200,
        ellipsis: false,
      })
    }

    return resColumns
  }, [globalData.filesOriginal, globalData.filesFiltered, globalData.filesRenamed])

  return (<div className={baseCls}>
    <div className={`${baseCls}-table`} ref={wrapperRef}>
      <Table
        columns={columns}
        dataSource={globalData.filesRenamed ?? globalData.filesFiltered ?? globalData.filesOriginal}
        bordered={false}
        rowKey={'path'}
        pagination={false}
        sticky={{ getContainer: () => wrapperRef.current || document.body }}
        size="small"
      />
    </div>
  </div >)
}

Content.defaultProps = {}
Content.displayName = baseCls
export default Content