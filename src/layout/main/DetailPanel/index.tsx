import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './index.scss'
import { useConfigContext } from '@/context/config'
import { useRuntimeContext } from '@/context/runtime'
import { useMultiLang } from '@/utils/mlang'
import { useLogger } from '@/utils/logger'
import { FileItemExtend } from '@/types/file'
import { ColumnsType } from 'antd/es/table'
import { VirtualTable } from '@/components/VirtualTable'
import { MultiLangProps } from '@/types/mlang'
import { Button, Flex, Radio } from 'antd'

interface IProps extends MultiLangProps {}

const baseCls = 'details'
const Content: FC<IProps> = (props) => {
  // Global Config
  const [config, setConfig] = useConfigContext()
  // Runtime Data
  const [runtime, setRuntime] = useRuntimeContext()
  // Multi-Language
  const { fmlName, fmlText } = useMultiLang(config, baseCls, props.inheritName)
  // Logs
  const con = useLogger()
  const { logs, logger } = con

  const wrapperRef = useRef<HTMLDivElement>(null)

  // auto format file size with suffix KB, MB, GB, TB
  const formatFileSize = useCallback((size: number) => {
    if (size < 1024) return `${size} B`
    if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`
    if (size < 1073741824) return `${(size / 1048576).toFixed(2)} MB`
    if (size < 1099511627776) return `${(size / 1073741824).toFixed(2)} GB`
    return `${(size / 1099511627776).toFixed(2)} TB`
  }, [])

  const [data, setData] = useState<FileItemExtend[]>([])

  // 视图模式
  const [viewMode, setViewMode] = useState<'source' | 'result'>('source')
  // Result 模式下的过滤器选项
  const [resRange, setResRange] = useState<'all' | 'flow_ok' | 'output_ok'>('flow_ok')

  useEffect(() => {
    if (runtime.fileList.length > 0) {
      switch (resRange) {
        case 'all':
          setData(runtime.fileList)
          break
        case 'flow_ok':
          setData(runtime.fileList.filter((item) => item.steps.length > 0 && (item.steps[item.steps.length - 1].next || item.steps[item.steps.length - 1].to)))
          break
        case 'output_ok':
          setData(runtime.fileList.filter((item) => item.steps.length > 0 && item.steps[item.steps.length - 1].to))
          break
      }
    } else {
      setData([])
    }
  }, [runtime.fileList, resRange, viewMode])

  const columns = useMemo(() => {
    const resColumns: ColumnsType<FileItemExtend> = [
      {
        title: fmlText('name'),
        dataIndex: 'name',
      },
      {
        title: fmlText('size'),
        dataIndex: 'size',
        width: 75,
        render: (size: number) => formatFileSize(size),
      },
      {
        title: fmlText('file_ext'),
        width: 80,
        dataIndex: 'fileExt',
      },
      {
        title: fmlText('path'),
        dataIndex: 'path',
      },
    ]

    // if (globalData.filesRenamed) {
    //   resColumns.splice(0, 3, {
    //     title: '原文件名',
    //     dataIndex: 'full_name',
    //   }, {
    //     title: '重命名后',
    //     dataIndex: 'rename_full_name',
    //   })
    // }

    return resColumns
  }, [fmlText, runtime])

  return (<div className={baseCls}>
    <Flex gap='4px' justify='flex-end' style={{ padding: '4px' }}>
      <Radio.Group size='small' value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
        <Radio.Button value='source'>Source</Radio.Button>
        <Radio.Button value='result'>Result</Radio.Button>
      </Radio.Group>
      <Radio.Group size='small' disabled={viewMode === 'source'} value={resRange} onChange={(e) => setResRange(e.target.value)}>
        <Radio.Button value='all'>All</Radio.Button>
        <Radio.Button value='flow_ok'>P.Flow</Radio.Button>
        <Radio.Button value='output_ok'>P.Result</Radio.Button>
      </Radio.Group>
    </Flex>
    <div className={`${baseCls}-table`} ref={wrapperRef}>
      <VirtualTable
        columns={columns}
        // dataSource={runtime.originList}
        dataSource={viewMode === 'source' ? runtime.fileList : data}
        bordered={false}
        rowKey={'path'}
      />
    </div>
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as DetailPanel }
export type { IProps as DetailPanelProps }