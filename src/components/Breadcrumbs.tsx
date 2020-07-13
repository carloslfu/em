import React from 'react'
import classNames from 'classnames'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { isMobile } from '../browser'
import { ancestors, strip } from '../util'
import { Child, Path } from '../types'
import { GenericObject } from '../utilTypes'

// components
import Link from './Link'
import Superscript from './Superscript'

interface BreadcrumbProps {
  path: Path,
  thoughtsLimit?: number,
  charLimit?: number,
  classNamesObject?: GenericObject<boolean>,
}

type OverflowChild = Child & {
  isOverflow?: boolean,
  label?: string,
}

/** Main navigation breadcrumbs.
 *
 * @param thoughtsLimit Max number of thoughts to be shown in a path without ellipsis.
 * @param charLimit Max number of character of a thought value that can be shown , if maxed out will be replaced by ellipsis.
 */
// NOTE: Exporting as default breaks /build (???)
export const Breadcrumbs = ({ path, thoughtsLimit, charLimit, classNamesObject }: BreadcrumbProps) => {
  // if thoughtsLimit or charLimit is not passed , the default value of ellipsize will be false and component will have default behaviour
  const [ellipsize, setEllipsize] = React.useState(thoughtsLimit !== undefined && charLimit !== undefined)

  // calculate if the overflow occurs during ellipsized view
  // 0 if thoughtsLimit is not defined
  const overflow = path.length > thoughtsLimit! ?
    path.length - thoughtsLimit! + 1
    : 0

  // if charLimit is exceeded then replace the remaining characters by ellipsis
  const charLimitedArray = ellipsize ? path.map(thought =>
    ({
      ...thought,
      // subtract 2 so that additional '...' is still within the char limit
      label: strip(thought.value.length > charLimit! - 2 ?
        thought.value.substr(0, charLimit! - 2) + '...'
        : thought.value)
    }))
    : path

  // after character limit is applied we need to remove the overflow thoughts if any and add isOverflow flag to render ellipsis at that position
  const overflowArray = ellipsize && overflow ?
    // @ts-ignore
    charLimitedArray.slice(0, charLimitedArray.length - 1 - overflow).concat({ isOverflow: true }, charLimitedArray.slice(charLimitedArray.length - 1))
    : charLimitedArray

  return (
    <div className={classNames({
      breadcrumbs: true,
      nonempty: overflowArray.length > 0,
      ...classNamesObject,
    })}>
      <TransitionGroup>
        {overflowArray.map((thoughtRanked: OverflowChild, i) => {
          const subthoughts = !thoughtRanked.isOverflow ? ancestors(path, thoughtRanked) : null
          return <CSSTransition key={i} timeout={600} classNames='fade-600'>
            {/* Cannot use React.Fragment with CSSTransition, as it applies the class to the first child */}
            {/* isOverflow is only applied to the object when ellipsis is true and number of thoughts exceeds thoughtsLimit. So if overflow is true we can just shrink the path by rendering "..." ellipsis to fit everything in a single line. */}
            {!thoughtRanked.isOverflow ?
              <span>
                {!isMobile || i > 0 ? <span className='breadcrumb-divider'> • </span> : null}
                {subthoughts && <Link thoughtsRanked={subthoughts} label={thoughtRanked.label} />}
                {subthoughts && <Superscript thoughtsRanked={subthoughts} />}
              </span>
              :
              <span>
                <span className='breadcrumb-divider'> • </span>
                <span onClick={() => setEllipsize(false)}> ... </span>
              </span>

            }
          </CSSTransition>
        })}
      </TransitionGroup>
    </div>)
}
