import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

interface Item {
  id: string;
  content: string;
}

interface Container {
  id: string;
  items: Item[];
}

export default function MultiList() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [containers, setContainers] = useState<Container[]>([
    {
      id: 'A',
      items: [
        { id: '1', content: 'Item 1' },
        { id: '2', content: 'Item 2' },
      ],
    },
    {
      id: 'B',
      items: [
        { id: '3', content: 'Item 3' },
        { id: '4', content: 'Item 4' },
        { id: '5', content: 'Item 5' },
        { id: '6', content: 'Item 6' },
      ],
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null); 
    const { active, over } = event;
    if (!over) return;

    // 获取源容器和目标容器
    const sourceContainer = containers.find(container =>
      container.items.some(item => item.id === active.id)
    );
    const targetContainer = containers.find(container =>
      container.items.some(item => item.id === over.id)
    );

    if (!sourceContainer || !targetContainer) return;

    // 检查目标容器是否已满
    if (
      sourceContainer.id !== targetContainer.id &&
      targetContainer.items.length >= 5
    ) {
      return;
    }

    // 获取索引
    const activeIndex = sourceContainer.items.findIndex(
      item => item.id === active.id
    );
    const overIndex = targetContainer.items.findIndex(
      item => item.id === over.id
    );

    // 相同容器内移动
    if (sourceContainer.id === targetContainer.id) {
      const newItems = arrayMove(
        sourceContainer.items,
        activeIndex,
        overIndex
      );

      setContainers(containers.map(container =>
        container.id === sourceContainer.id
          ? { ...container, items: newItems }
          : container)
      );
    } else {
      // 跨容器移动
      const [removed] = sourceContainer.items.splice(activeIndex, 1);
      console.log('overIndex', overIndex)
      targetContainer.items.splice(overIndex, 0, removed);

      setContainers(containers.map(container => {
        if (container.id === sourceContainer.id) {
          return { ...container, items: [...sourceContainer.items] };
        }
        if (container.id === targetContainer.id) {
          return { ...container, items: [...targetContainer.items] };
        }
        return container;
      }));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragStart={(event: DragStartEvent) => {
        setActiveId(event.active.id as string);
      }}
    >
      <div style={{ display: 'flex', gap: '20px' }}>
        {containers.map(container => (
          <div
            key={container.id}
            style={{
              background: '#f0f0f0',
              padding: '20px',
              borderRadius: '8px',
              minWidth: '300px',
            }}
          >
            <h3>List {container.id}</h3>
            <SortableContext
              items={container.items}
              strategy={verticalListSortingStrategy}
            >
              <div style={{ minHeight: '200px' }}>
                {container.items.map(item => (
                  <SortableItem key={item.id} id={item.id}>
                    {item.content}
                  </SortableItem>
                ))}
              </div>
              {container.items.length >= 5 && (
                <div style={{ color: 'red', marginTop: '8px' }}>
                  该列表已满（最多5项）
                </div>
              )}
            </SortableContext>
            <footer>上传底部</footer>
          </div>
        ))}
      </div>
      <DragOverlay>
        {/* 拖拽时的预览效果 */}
        {activeId ? (
          <div
            style={{
              background: 'white',
              padding: '16px',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {containers
              .find(container =>
                container.items.some(item => item.id === activeId)
              )
              ?.items.find(item => item.id === activeId)?.content}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}