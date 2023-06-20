import React, { FC } from 'react'

interface IProps {
  example?: any
}

const baseCls = 'Content'
const Content: FC<IProps> = (props) => {
  return (<div>Content</div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as Content }
export type { IProps as ContentProps }