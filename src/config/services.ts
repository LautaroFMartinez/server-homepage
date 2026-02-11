/**
 * Services Configuration
 * @author Lautaro F. Martinez
 */

export interface Service {
  name: string;
  url: string;
  icon: string;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'cyan' | 'orange';
  description: string;
}

export const services: Service[] = [
  {
    name: 'Home Assistant',
    url: 'https://ha.lau.ar',
    icon: '\u{1F3E0}',
    color: 'cyan',
    description: 'Automatizacion del hogar'
  },
  {
    name: 'Pi-hole',
    url: 'https://pihole.lau.ar',
    icon: '\u{1F6E1}',
    color: 'red',
    description: 'DNS y ad-blocker'
  },
  {
    name: 'Nginx Proxy Manager',
    url: 'https://npm.lau.ar',
    icon: '\u{1F310}',
    color: 'green',
    description: 'Reverse proxy'
  },
  {
    name: 'Portainer',
    url: 'https://portainer.lau.ar',
    icon: '\u{1F433}',
    color: 'blue',
    description: 'Docker management'
  },
  {
    name: 'Cockpit',
    url: 'https://cockpit.lau.ar',
    icon: '\u{2699}',
    color: 'purple',
    description: 'Server administration'
  },
  {
    name: 'Mealie',
    url: 'https://mealie.lau.ar',
    icon: '\u{1F95E}',
    color: 'orange',
    description: 'Recetas y planificacion de comidas'
  },
  {
    name: 'Grafana',
    url: 'https://grafana.lau.ar',
    icon: '\u{1F4CA}',
    color: 'orange',
    description: 'Monitoreo y visualizacion'
  },
  {
    name: 'n8n',
    url: 'https://n8n.lau.ar',
    icon: '\u{1F504}',
    color: 'purple',
    description: 'Automatizacion de flujos de trabajo'
  },
  {
    name: 'WireGuard',
    url: 'https://wireguard.lau.ar',
    icon: '\u{1F512}',
    color: 'blue',
    description: 'VPN segura'
  }
  ,
    {
      name: 'Sonarr',
      url: 'https://sonarr.lau.ar',
      icon: '\u{1F4FA}',
      color: 'cyan',
      description: 'Gestion de series de TV'
    },
    {
      name: 'Radarr',
      url: 'https://radarr.lau.ar',
      icon: '\u{1F3AC}',
      color: 'yellow',
      description: 'Gestion de peliculas'
    },
    {
      name: 'Bazarr',
      url: 'https://bazarr.lau.ar',
      icon: '\u{1F4DD}',
      color: 'green',
      description: 'Gestion de subtitulos'
    },
    {
      name: 'Jellyfin',
      url: 'https://jellyfin.lau.ar',
      icon: '\u{1F3A5}',
      color: 'purple',
      description: 'Media server'
    }
    ,
      {
        name: 'Prowlarr',
        url: 'https://prowlarr.lau.ar',
        icon: '\u{1F50D}',
        color: 'orange',
        description: 'Gestion de indexadores'
      }
];

export const QUICK_ACCESS_COUNT = 3;
