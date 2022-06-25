import { Button } from 'antd'

import { useState, useMemo } from 'react'

import RichNote from './RichNote'

export default function Paragraph({
  description,
  characterLimit,
}: {
  description: string
  characterLimit?: number
}) {
  const CHARACTER_LIMIT_EXCEEDED =
    (characterLimit && description.length > characterLimit) ||
    description.split('\n').length > 3

  const [expanded, setExpanded] = useState<boolean>(false)
  const toggleExpanded = () => setExpanded(!expanded)

  // Apply character limit to first 3 lines
  const shortDescription = useMemo(() => {
    const allLines = description.split('\n')
    const firstThreeLines = allLines.slice(0, 3).join('\n')
    return `${firstThreeLines.slice(0, characterLimit).trim()}...`
  }, [characterLimit, description])

  return (
    <div>
      <RichNote
        style={{ maxWidth: '700px', display: 'inline' }} // good line length for reading
        note={
          !expanded && CHARACTER_LIMIT_EXCEEDED ? shortDescription : description
        }
      >
        {CHARACTER_LIMIT_EXCEEDED && (
          <Button
            type="link"
            style={{ padding: 0, paddingBottom: 0, height: 'auto' }}
            onClick={() => toggleExpanded()}
          >
            {expanded ? 'Read less' : 'Read more'}
          </Button>
        )}
      </RichNote>
    </div>
  )
}