import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaBolt, FaCheckCircle, FaChevronRight, FaUsers } from 'react-icons/fa';
import { Stagger, staggerItem } from '../../components/motion';
import { useLanguage } from '../../context/LanguageContext';
import vendorGroups from '../../data/vendorGroups';
import { DEFAULT_MAP_CENTER } from '../../config/app';
import GroupDetails from './GroupDetails';
import BarterBoard from './BarterBoard';
import './TradeSection.css';

// Map pins drawn in CSS instead of Leaflet's PNG marker images.
const pinIcon = (verified) =>
  L.divIcon({
    className: '',
    html: `<span class="map-pin${verified ? ' map-pin-verified' : ''}"><span class="map-pin-dot"></span></span>`,
    iconSize: [30, 40],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });
const PIN = { verified: pinIcon(true), regular: pinIcon(false) };

const GroupBadges = ({ group }) => {
  const { t } = useLanguage();
  return (
    <span className="group-badges">
      {group.verified && <span className="badge badge-success"><FaCheckCircle aria-hidden="true" /> {t('verified')}</span>}
      {group.fastDelivery && <span className="badge"><FaBolt aria-hidden="true" /> {t('fastDelivery')}</span>}
    </span>
  );
};

const TradeSection = () => {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState(null);
  const selectedGroup = vendorGroups.find((g) => g.id === selectedId) || null;

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">{t('vendorMap')}</h1>
        <p className="page-subtitle">{t('tradeSubtitle')}</p>
      </header>

      <motion.div
        className="map-wrap"
        role="region"
        aria-label={t('mapLabel')}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <MapContainer center={DEFAULT_MAP_CENTER} zoom={11} scrollWheelZoom={false} className="vendor-map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {vendorGroups.map((group) => (
            <Marker key={group.id} position={[group.lat, group.lng]} title={group.name} icon={group.verified ? PIN.verified : PIN.regular}>
              <Popup>
                <strong>{group.name}</strong>
                <br />
                {t('members', { n: group.members })}
                <br />
                <button type="button" className="btn btn-sm map-popup-btn" onClick={() => setSelectedId(group.id)}>
                  {t('rateFeedback')}
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </motion.div>

      <section className="card trade-groups" aria-labelledby="group-list-title">
        <h2 id="group-list-title" className="card-title">
          <span className="card-title-icon"><FaUsers aria-hidden="true" /></span>
          {t('groupList')}
        </h2>
        <Stagger as="ul" className="group-list" stagger={0.035} delay={0.1}>
          {vendorGroups.map((group) => (
            <motion.li key={group.id} variants={staggerItem}>
              <button type="button" className="group-row" onClick={() => setSelectedId(group.id)}>
                <span className="group-avatar" aria-hidden="true">{group.name.charAt(0)}</span>
                <span className="group-row-main">
                  <strong>{group.name}</strong>
                  <span className="muted">{t('members', { n: group.members })} · {group.offer}</span>
                </span>
                <GroupBadges group={group} />
                <FaChevronRight className="group-row-chevron" aria-hidden="true" />
              </button>
            </motion.li>
          ))}
        </Stagger>
      </section>

      <BarterBoard />

      <GroupDetails group={selectedGroup} onClose={() => setSelectedId(null)} badges={selectedGroup && <GroupBadges group={selectedGroup} />} />
    </div>
  );
};

export default TradeSection;
