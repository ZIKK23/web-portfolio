'use client';

import { useEffect, useRef } from 'react';

const BASE_TEXT = "Hi! I'm";
const VOWEL_REGEX = /^[aeiouAEIOU]$/;

const PAGE_REDIRECTS: Record<string, string> = {
  'Full-Stack Dev': '/projects',
};

export default function RolePicker() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const labelElement = root.querySelector<HTMLElement>('.typewriter-animation');
    const categorySelectElement = root.querySelector<HTMLElement>('.categorySelect');
    const categoryDropZoneElement = root.querySelector<HTMLElement>('#category-drop-zone');
    const placeholderElement = root.querySelector<HTMLElement>('.placeholder-text');
    const draggableItems = root.querySelectorAll<HTMLElement>('.draggable-item');

    const initialOrder: string[] = [];

    function setLabelArticle(text: string) {
      if (!labelElement) return;
      const article = VOWEL_REGEX.test(text.charAt(0)) ? ' an' : ' a';
      labelElement.textContent = BASE_TEXT + article;
    }

    function handleDragStart(event: DragEvent) {
      const target = event.target as HTMLElement;
      event.dataTransfer?.setData('text/plain', target.id);
      const isDropZoneOccupied = categoryDropZoneElement?.querySelector('.draggable-item');

      if (!isDropZoneOccupied && placeholderElement) {
        placeholderElement.textContent = target.id;
        setLabelArticle(target.id);
        target.style.opacity = '0';
      }
    }

    function handleDragEnd(event: DragEvent) {
      const target = event.currentTarget as HTMLElement;
      if (placeholderElement) {
        placeholderElement.textContent = '';
        target.style.opacity = '1';
      }
    }

    function handleDragOver(event: DragEvent) {
      event.preventDefault();
      if (placeholderElement) setLabelArticle(placeholderElement.textContent || '');
    }

    function handleReturnDrop(event: { preventDefault: () => void; currentTarget: HTMLElement; dataTransfer: { getData: (t?: string) => string } }) {
      event.preventDefault();
      const draggedItemId = event.dataTransfer.getData('text/plain');
      const draggedElement = document.getElementById(draggedItemId);
      const returnZone = event.currentTarget;

      if (draggedElement) {
        const droppedIndex = initialOrder.indexOf(draggedElement.id);
        let nextSibling: Element | null = null;

        for (let i = droppedIndex + 1; i < initialOrder.length; i++) {
          const siblingId = initialOrder[i];
          const siblingElement = returnZone.querySelector('#' + siblingId);
          if (siblingElement) {
            nextSibling = siblingElement;
            break;
          }
        }
        if (nextSibling) {
          returnZone.insertBefore(draggedElement, nextSibling);
        } else {
          returnZone.appendChild(draggedElement);
        }
      }

      const isDropZoneEmpty = !categoryDropZoneElement?.querySelector('.draggable-item');
      if (isDropZoneEmpty) setLabelArticle('Full-Stack Dev');
    }

    function handleDrop(event: DragEvent) {
      event.preventDefault();
      const draggedItemId = event.dataTransfer?.getData('text/plain') ?? '';
      const draggedElement = document.getElementById(draggedItemId);
      const dropZone = event.currentTarget as HTMLElement;
      if (!draggedElement) return;

      const existingItem = dropZone.querySelector('.draggable-item');
      if (existingItem && categorySelectElement) {
        handleReturnDrop({
          preventDefault: () => {},
          currentTarget: categorySelectElement,
          dataTransfer: { getData: () => existingItem.id },
        });
      }

      dropZone.appendChild(draggedElement);
      setLabelArticle(draggedElement.id);

      const redirectUrl = PAGE_REDIRECTS[draggedItemId];
      if (redirectUrl) {
        document.body.classList.add('fade-out');
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);
      }
    }

    if (labelElement) labelElement.textContent = BASE_TEXT + ' a';

    categoryDropZoneElement?.addEventListener('dragover', handleDragOver);
    categoryDropZoneElement?.addEventListener('drop', handleDrop);

    draggableItems.forEach((item) => {
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragend', handleDragEnd);
      initialOrder.push(item.id);
    });

    categorySelectElement?.addEventListener('dragover', handleDragOver);
    categorySelectElement?.addEventListener('drop', handleReturnDrop as unknown as EventListener);
    const onDragEnter = () => categorySelectElement?.classList.add('drag-over');
    const onDragLeave = () => categorySelectElement?.classList.remove('drag-over');
    categorySelectElement?.addEventListener('dragenter', onDragEnter);
    categorySelectElement?.addEventListener('dragleave', onDragLeave);

    return () => {
      categoryDropZoneElement?.removeEventListener('dragover', handleDragOver);
      categoryDropZoneElement?.removeEventListener('drop', handleDrop);
      draggableItems.forEach((item) => {
        item.removeEventListener('dragstart', handleDragStart);
        item.removeEventListener('dragend', handleDragEnd);
      });
      categorySelectElement?.removeEventListener('dragover', handleDragOver);
      categorySelectElement?.removeEventListener('drop', handleReturnDrop as unknown as EventListener);
      categorySelectElement?.removeEventListener('dragenter', onDragEnter);
      categorySelectElement?.removeEventListener('dragleave', onDragLeave);
    };
  }, []);

  return (
    <section ref={rootRef} className="role-picker-section">
      <div className="job-role-container">
        <h2 className="typewriter-animation"></h2>
        <div id="category-drop-zone">
          <span className="placeholder-text">[Drop Here]</span>
        </div>
      </div>

      <div className="categorySelect" role="group" aria-label="Drag and drop job roles" id="role-instructions">
        <span id="Full-Stack Dev" className="draggable-item" draggable="true">
          <span className="bracket" aria-hidden="true">[</span>Full-Stack Dev<span className="bracket" aria-hidden="true">]</span>
        </span>
      </div>
    </section>
  );
}
