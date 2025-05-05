/**
 * Gerenciador de Sons para Barunião
 * Responsável por reproduzir efeitos sonoros no sistema
 */

const SoundManager = {
    // Define os caminhos para os arquivos de som
    SOUNDS: {
        CLOSE_TAB: 'assets/sounds/som.mp3',
    },
    
    // Cache para os objetos de áudio
    _audioCache: {},
    
    // Configurações
    _settings: {
        enabled: true,
        volume: 0.5
    },
    
    // Inicializa o gerenciador de som carregando as configurações
    init: function() {
        // Carregar configurações do localStorage
        const settings = localStorage.getItem('soundSettings');
        if (settings) {
            try {
                this._settings = JSON.parse(settings);
            } catch (e) {
                console.error('Erro ao carregar configurações de som:', e);
            }
        }
        
        // Pré-carregar os sons
        this._preloadSounds();
        
        console.log('SoundManager inicializado com sucesso.');
        return this;
    },
    
    // Pré-carrega os sons para evitar atrasos
    _preloadSounds: function() {
        for (const key in this.SOUNDS) {
            this._getAudio(this.SOUNDS[key]);
        }
    },
    
    // Obtém ou cria um objeto de áudio
    _getAudio: function(src) {
        if (!this._audioCache[src]) {
            const audio = new Audio(src);
            audio.preload = 'auto';
            this._audioCache[src] = audio;
        }
        return this._audioCache[src];
    },
    
    // Reproduz um som
    playSound: function(soundKey) {
        if (!this._settings.enabled) return;
        
        try {
            const soundPath = this.SOUNDS[soundKey];
            if (!soundPath) {
                console.error(`Som "${soundKey}" não encontrado.`);
                return;
            }
            
            console.log(`Reproduzindo som: ${soundKey} (${soundPath})`);
            
            const audio = this._getAudio(soundPath);
            
            // Reinicia o áudio se já estiver tocando
            audio.pause();
            audio.currentTime = 0;
            
            // Define o volume
            audio.volume = this._settings.volume;
            
            // Reproduz o som
            const playPromise = audio.play();
            
            // Lidar com possíveis erros (navegadores podem bloquear reprodução automática)
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('Erro ao reproduzir som:', error);
                });
            }
        } catch (error) {
            console.error('Erro ao reproduzir som:', error);
        }
    },
    
    // Habilita ou desabilita os sons
    setEnabled: function(enabled) {
        this._settings.enabled = enabled;
        this._saveSettings();
    },
    
    // Define o volume (0.0 a 1.0)
    setVolume: function(volume) {
        this._settings.volume = Math.min(1, Math.max(0, volume));
        this._saveSettings();
    },
    
    // Salva as configurações
    _saveSettings: function() {
        try {
            localStorage.setItem('soundSettings', JSON.stringify(this._settings));
        } catch (e) {
            console.error('Erro ao salvar configurações de som:', e);
        }
    },
    
    // Verifica se os sons estão habilitados
    isEnabled: function() {
        return this._settings.enabled;
    },
    
    // Obtém o volume atual
    getVolume: function() {
        return this._settings.volume;
    }
};

// Inicializa o gerenciador de som automaticamente
SoundManager.init(); 