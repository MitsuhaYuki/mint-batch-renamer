
import React, { useEffect, useRef, useState } from 'react'
import type { TableProps } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { Table, theme } from 'antd'
import { VariableSizeGrid as Grid } from 'react-window'
import { useSize } from 'ahooks'
import './index.scss'

export interface VirtualTableProps<RecordType> extends Omit<TableProps<RecordType>, 'pagination' | 'scroll' | 'size' | 'columns'> {
  columns?: ColumnsType<RecordType>
  scroll?: { x?: number, y?: number }
}

const baseCls = 'virtual-table'
export const VirtualTable = <RecordType extends object> (props: VirtualTableProps<RecordType>) => {
  const { columns = [], scroll, ...restProps } = props
  const { token } = theme.useToken()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const wrapperSize = useSize(wrapperRef)
  const tableWidth = wrapperSize?.width ?? 0
  const scrollArea = {
    x: scroll?.x,
    y: (scroll?.y ?? wrapperSize?.height ?? 0) - 40,
  }

  const getMergedColumns = (columns: ColumnsType<RecordType>) => {
    let noWidthCols = 0
    let allocatedWidth = 0

    columns.forEach(item => {
      item.width ? (allocatedWidth += item.width as number) : noWidthCols++
    })

    let avgWidth = Math.floor((tableWidth - allocatedWidth) / noWidthCols)
    if (avgWidth < 100) avgWidth = 100

    return columns.map((item) => {
      if (item.width) {
        return item
      }
      return {
        ...item,
        width: avgWidth,
      }
    })
  }
  const mergedColumns = getMergedColumns(columns)

  const gridRef = useRef<any>()
  const [connectObject] = useState<any>(() => {
    const obj = {}
    Object.defineProperty(obj, 'scrollLeft', {
      get: () => {
        if (gridRef.current) {
          return gridRef.current?.state?.scrollLeft
        }
        return null
      },
      set: (scrollLeft: number) => {
        if (gridRef.current) {
          gridRef.current.scrollTo({ scrollLeft })
        }
      },
    })

    return obj
  })

  const resetVirtualGrid = () => {
    gridRef.current?.resetAfterIndices({
      columnIndex: 0,
      shouldForceUpdate: true,
    })
  }

  useEffect(() => resetVirtualGrid, [tableWidth])

  const renderVirtualList = (rawData: readonly object[], { scrollbarSize, ref, onScroll }: any) => {
    ref.current = connectObject
    const totalHeight = rawData.length * 40

    return (
      <Grid
        ref={gridRef}
        className={`${baseCls}-grid`}
        columnCount={mergedColumns.length}
        columnWidth={(index: number) => {
          const { width } = mergedColumns[index]
          return totalHeight > (scrollArea?.y as number) && index === mergedColumns.length - 1
            ? (width as number) - scrollbarSize - 1
            : (width as number)
        }}
        height={scrollArea!.y as number}
        rowCount={rawData.length}
        rowHeight={() => 40}
        width={tableWidth}
        onScroll={({ scrollLeft }: { scrollLeft: number }) => {
          onScroll({ scrollLeft })
        }}
      >
        {({
          columnIndex,
          rowIndex,
          style,
        }: {
          columnIndex: number
          rowIndex: number
          style: React.CSSProperties
        }) => (
          <div
            className={`${baseCls}-cell ${columnIndex === mergedColumns.length - 1 ? `${baseCls}-cell-last` : ''}`}
            title={(rawData[rowIndex] as any)[(mergedColumns as any)[columnIndex].dataIndex]}
            style={{
              ...style,
              boxSizing: 'border-box',
              padding: token.paddingXS,
              borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`,
              background: token.colorBgContainer,
              lineHeight: token.lineHeightSM,
            }}
          >
            {(rawData[rowIndex] as any)[(mergedColumns as any)[columnIndex].dataIndex]}
          </div>
        )}
      </Grid>
    )
  }

  return (
    <div className={baseCls} ref={wrapperRef}>
      <Table
        {...restProps}
        className={`${baseCls}-inner`}
        columns={mergedColumns}
        components={{
          body: renderVirtualList,
        }}
        pagination={false}
        scroll={scrollArea}
        size='small'
      />
    </div>
  )
}
