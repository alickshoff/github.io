(function () {
    'use strict';

    // --- 1. Безопасный запуск (ждем загрузки Lampa) ---
    function startPlugin() {
        if (window.my_ultimate_plugin) return;
        window.my_ultimate_plugin = true;
        
        console.log('✅ Современный плагин загружен!');

        // --- 2. ДОБАВЛЯЕМ IPTV (Каналы) ---
        // Активируем стандартный IPTV модуль Lampa, если он отключен
        if (Lampa.Plugins.iptv) {
            // Убеждаемся, что иконка в меню активна
            Lampa.Storage.set('iptv_enable', true);
            
            // Добавляем источник каналов (M3U + EPG)
            // ВАЖНО: Здесь нужны твои реальные ссылки
            Lampa.Source.add('iptv_my', {
                title: 'Мои ТВ Каналы',
                source: 'iptv',
                url: 'https://example.com/path/to/your/channels.m3u', // ССЫЛКА НА M3U
                epg: 'https://example.com/path/to/epg.xml',         // ССЫЛКА НА EPG
                // Фильтр для клубнички (скрыть/показать)
                adult: false 
            });
            
            console.log('📺 IPTV модуль активирован');
        }

        // --- 3. ДОБАВЛЯЕМ КЛУБНИЧКУ (Adult Content) ---
        // Можно добавить отдельный раздел в меню или просто включить фильтр
        // Если в M3U есть категория "Adult", Lampa отобразит её при выключенном родительском контроле
        
        // Альтернативный способ: добавить кнопку в настройки
        Lampa.SettingsApi.addParam({
            component: 'main',
            param: {
                name: 'adult_content',
                type: 'trigger',
                default: false
            },
            field: {
                name: '🔞 Показывать клубничку',
                description: 'Включить отображение каналов 18+ в IPTV'
            },
            onChange: function (value) {
                Lampa.Storage.set('adult_enabled', value === 'true');
                Lampa.Listener.send('iptv', { type: 'reload' });
            }
        });

        // --- 4. МОДУЛЬ ФИЛЬМОВ И СЕРИАЛОВ (VOD) ---
        // Это подключит внешний источник ссылок, например Lampac
        // Пример добавления источника онлайн-кинотеатров
        if (Lampa.Manifest.app_digital >= 300) {
            // Современный метод для новых версий Lampa
            Lampa.Source.add('online_custom', {
                title: 'HD Rezka / Кино',
                source: 'online',
                url: 'https://lampac.org/api/vod.json', // Пример API
                proxy: true
            });
        } else {
            // Старый метод для совместимости
            Lampa.Source.add('online_custom', {
                title: 'Кино и Сериалы',
                source: 'online',
                url: 'http://your-backend.com/api'
            });
        }

        // --- 5. СОВРЕМЕННЫЙ ПЛЕЕР (Force External/Internal) ---
        // Заставляем Lampa использовать крутой плеер (VLC, MPV или встроенный с аппаратным декодированием)
        
        // Вариант A: Использовать системный/внешний плеер (VLC - самый мощный)
        // Раскомментируй, если хочешь, чтобы кино открывалось в VLC автоматически
        /*
        if (Lampa.Player) {
            Lampa.Player.play = function(url, options) {
                if (Platform.is('android') && Lampa.Storage.get('use_vlc', false)) {
                    // Запуск через intent VLC
                    window.location.assign('vlc://' + encodeURIComponent(url));
                } else {
                    // Штатный плеер Lampa (тоже норм)
                    Lampa.Player.playDefault(url, options);
                }
            };
        }
        */

        // Вариант B: Настройка встроенного плеера для максимальной совместимости
        // Включаем аппаратное ускорение
        Lampa.Storage.set('player_hardware', true);
        Lampa.Storage.set('player_background', 'dark'); // Классный темный фон
        
        console.log('🎮 Современный плеер настроен');
        
        // --- 6. КАСТОМНЫЙ CSS (Для красоты) ---
        if (!document.getElementById('my_custom_css')) {
            var style = document.createElement('style');
            style.id = 'my_custom_css';
            style.textContent = `
                /* Делаем плеер более современным */
                .video-js .vjs-control-bar {
                    background: linear-gradient(to top, #000000cc, transparent);
                    font-size: 1.5rem;
                }
                /* Кастомная иконка в меню (если нужно) */
                .menu__item[data-component="iptv_my"] .menu__item-icon svg {
                    color: #ff5e00;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // --- 7. ЗАПУСК (Хук на событие готовности приложения) ---
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }
})();