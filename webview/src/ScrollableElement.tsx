import { forwardRef, useRef, type ReactNode } from 'react';

const CustomScrollContainer = forwardRef<HTMLDivElement, { children: ReactNode }>(
    ({ children }, ref) => {
        const thumbRef = useRef<HTMLDivElement>(null);
        const isDragging = useRef(false);

        function handleScroll(e: React.UIEvent<HTMLDivElement>) {
            if (!thumbRef.current) return;
            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
            const thumbHeight = (clientHeight / scrollHeight) * clientHeight;
            const thumbTop = (scrollTop / scrollHeight) * clientHeight;

            thumbRef.current.style.height = `${thumbHeight}px`;
            thumbRef.current.style.top = `${thumbTop}px`;
        }

        function handleThumbMouseDown(e: React.MouseEvent) {
            e.preventDefault();
            isDragging.current = true;

            const handleMouseMove = (e: MouseEvent) => {
                if (!isDragging.current) return;
                const scrollEl = (ref as React.RefObject<HTMLDivElement>)?.current;
                if (!scrollEl) return;
                
                const { scrollHeight, clientHeight } = scrollEl;
                scrollEl.scrollTop += (e.movementY / clientHeight) * scrollHeight;
            };

            const handleMouseUp = () => {
                isDragging.current = false;
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('mouseleave', handleMouseUp);
        }

        function handleTrackClick(e: React.MouseEvent) {
            const scrollEl = (ref as React.RefObject<HTMLDivElement>)?.current;
            if (!scrollEl || e.target !== e.currentTarget) return;
            const { clientHeight, scrollHeight } = scrollEl;
            const clickY = e.clientY - e.currentTarget.getBoundingClientRect().top;
            scrollEl.scrollTop = (clickY / clientHeight) * scrollHeight;
        }

        return (
            <div className='group flex h-full flex-row'>
                <div
                    ref={ref}
                    onScroll={handleScroll}
                    style={{ flex: 1, overflow: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <style>{`::-webkit-scrollbar { display: none; }`}</style>
                    {children}
                </div>
                <div
                    onClick={handleTrackClick}
                    className='bg-(--vscode-scrollbar-background) relative w-3.5'
                >
                    <div
                        ref={thumbRef}
                        onMouseDown={handleThumbMouseDown}
                        // tabIndex={0}
                        className=
                        {`
                        active:bg-(--vscode-scrollbarSlider-activeBackground)
                        bg-(--vscode-scrollbarSlider-background)
                        hover:bg-(--vscode-scrollbarSlider-hoverBackground)
                        
                        w-full
                        absolute

                        active:opacity-100
                        group-hover:opacity-100
                        opacity-0
                        
                        transition-opacity 
                        group-hover:duration-100
                        duration-800
                        `}
                    />
                </div>
            </div>
        );
    }
);

export default CustomScrollContainer;
