/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-unused-vars */

/* 
    https://github.com/atlassian/pragmatic-drag-and-drop/blob/main/packages/documentation/examples/list.tsx#L40
*/

import React, { useEffect, useRef, useState } from 'react';
import {
    draggable,
    monitorForElements,
    type ElementDropTargetEventBasePayload,
    dropTargetForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import invariant from 'tiny-invariant';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
    attachClosestEdge,
    Edge,
    extractClosestEdge,
  } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';

const GridItem = ({index, item}: {index: number, item: {id: string, content: string}}) => {

    const ref = useRef(null);
    const [dragging, setDragging] = useState<boolean>(false); // NEW
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

    useEffect(() => {
        const el = ref.current;
        invariant(el);

        const onChanege = ({ source, self }: ElementDropTargetEventBasePayload) => {
            if (source.element == el) {
				setClosestEdge(null);
				return;
			}
            const closestEdge = extractClosestEdge(self.data);

            const sourceIndex = source.data.index;
			invariant(typeof sourceIndex === 'number');

			const isItemBeforeSource = index === sourceIndex - 1;
			const isItemAfterSource = index === sourceIndex + 1;

			const isDropIndicatorHidden =
				(isItemBeforeSource && closestEdge === 'right') ||
				(isItemAfterSource && closestEdge === 'left');

			if (isDropIndicatorHidden) {
				setClosestEdge(null);
				return;
			}

			setClosestEdge(closestEdge);
        }

        return combine(
            draggable({
                element: el,
                getInitialData: () => ({ type: 'card', index: index }),
                onDragStart: () => setDragging(true), // NEW
                onDrop: () => setDragging(false), // NEW
                canDrag: () => index == 1
            }),
            dropTargetForElements({
                element: el,
                canDrop: () => true, // NEW
                getIsSticky: () => true, // NEW
                onDragEnter: onChanege,
                onDrag: onChanege,
                getData({input, element}) {
                    const data = { type: 'card', index: index };

                    return attachClosestEdge(data, {
                        input,
                        element,
                        allowedEdges: ['left', 'right'],
                    });
                },
                onDragLeave() {
					setClosestEdge(null);
				},
				onDrop() {
					setClosestEdge(null);
				},
            })
        );
    }, [index]);

    return <div ref={ref} style={{position: 'relative'}}>
        <div style={{width: 100, height: 100, background: '#f0f0f0'}}>
            {item.content} {dragging ? 'Dragging' : ''}
        </div>
        {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
    </div>
}

const Grid = () => {
    const [items, setItems] = useState([
        { id: '1', content: 'Item 1' },
        { id: '2', content: 'Item 2' },
        { id: '3', content: 'Item 3' }, 
        { id: '4', content: 'Item 4' },
        { id: '5', content: 'Item 5' },
        { id: '6', content: 'Item 6' },
        { id: '7', content: 'Item 7' },
    ])
    useEffect(() => {
        return monitorForElements({
        //   onDragStart: () => console.log('A file is dragging!'),
          onDrop({source, location}) {
            console.log('A file was dropped!');

            const target = location.current.dropTargets[0];
				if (!target) {
					return;
				}

				const sourceData = source.data;
				const targetData = target.data;
            console.log('sourceData', sourceData)
            console.log('targetData', targetData)
            
            setItems((origin) => {
                const newItems = [...origin];
                const startIndex = sourceData.index as number;
                const indexOfTarget = targetData.index as number;
                
                // const edge = extractClosestEdge(targetData);
                const closestEdgeOfTarget = extractClosestEdge(targetData);



                const finishIndex = getReorderDestinationIndex({
                    startIndex,
                    closestEdgeOfTarget,
                    indexOfTarget,
                    axis: 'horizontal',
                });

                const e = reorder({
                    list: newItems,
                    startIndex,
                    finishIndex,
                });

                console.log('e', e)

                return e
            })
          },
          onDrag(args) {
            // console.log('A file is being dragged!');
            // console.log(args);
          },
        });
      }, []);
    return <div style={{
        display: 'flex',
        gap: 10
    }}>
        {
            items.map((item, index) => {
                return <GridItem key={item.id} index={index} item={item} /> 
            })
        }
    </div>
}
export default Grid;