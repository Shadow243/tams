/**
 * Composable for sidebar toggle functionality
 * Handles both desktop and mobile scenarios
 */
export const useSidebarToggle = () => {
    const createBackdrop = () => {
        const backdrop = document.createElement('div')
        backdrop.id = 'sidebar-backdrop'
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999;
            cursor: pointer;
        `
        backdrop.addEventListener('click', closeSidebar)
        document.body.appendChild(backdrop)
    }
    
    const removeBackdrop = () => {
        const backdrop = document.getElementById('sidebar-backdrop')
        if (backdrop) {
            backdrop.removeEventListener('click', closeSidebar)
            backdrop.remove()
        }
    }
    
    const closeSidebar = () => {
        const body = document.body
        const html = document.documentElement
        
        html.classList.remove('sidebar-enable')
        body.style.overflow = ''
        removeBackdrop()
    }
    
    const toggleSidebar = () => {
        const body = document.body
        const html = document.documentElement
        const isMobile = window.innerWidth < 768
        
        if (isMobile) {
            // Mobile: toggle sidebar-enable class and body overflow
            const isOpen = html.classList.contains('sidebar-enable')
            
            if (isOpen) {
                closeSidebar()
            } else {
                html.classList.add('sidebar-enable')
                body.style.overflow = 'hidden'
                createBackdrop()
            }
        } else {
            // Desktop: toggle between on-hover and on-hover-active
            // Get config from sessionStorage
            let config: Record<string, any> = {}
            try {
                const savedConfig = sessionStorage.getItem('__THEME_CONFIG__')
                config = savedConfig ? JSON.parse(savedConfig) : {}
            } catch (e) {
                config = {}
            }
            
            const currentSize = html.getAttribute('data-sidenav-size') || 'on-hover-active'
            const newSize = currentSize === 'on-hover-active' ? 'on-hover' : 'on-hover-active'
            
            html.setAttribute('data-sidenav-size', newSize)
            config['sidenav-size'] = newSize
            
            // Toggle sidebar-enable class
            if (newSize === 'on-hover') {
                body.classList.add('sidebar-enable')
            } else {
                body.classList.remove('sidebar-enable')
            }
            
            // Update window.config
            if ((window as any).config) {
                (window as any).config['sidenav-size'] = newSize
            }
            
            // Save to sessionStorage
            sessionStorage.setItem('__THEME_CONFIG__', JSON.stringify(config))
        }
    }
    
    return {
        toggleSidebar
    }
}
