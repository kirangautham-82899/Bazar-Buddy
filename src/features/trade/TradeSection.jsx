import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaBolt, FaCheckCircle } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import vendorGroups from '../../data/vendorGroups';
import { DEFAULT_MAP_CENTER } from '../../config/app';
import GroupDetails from './GroupDetails';
import BarterBoard from './BarterBoard';
import './TradeSection.css';

// Bundlers don't resolve Leaflet's default marker images on their own.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

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
    <motion.div className="page" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="page-title">{t('vendorMap')}</h1>

      <div className="map-wrap" role="region" aria-label={t('mapLabel')}>
        <MapContainer center={DEFAULT_MAP_CENTER} zoom={11} scrollWheelZoom={false} className="vendor-map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {vendorGroups.map((group) => (
            <Marker key={group.id} position={[group.lat, group.lng]} title={group.name}>
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
      </div>

      <section className="card trade-groups" aria-labelledby="group-list-title">
        <h2 id="group-list-title" className="card-title">{t('groupList')}</h2>
        <ul className="group-list">
          {vendorGroups.map((group) => (
            <li key={group.id}>
              <button type="button" className="group-row" onClick={() => setSelectedId(group.id)}>
                <span className="group-row-main">
                  <strong>{group.name}</strong>
                  <span className="muted">{t('members', { n: group.members })} · {group.offer}</span>
                </span>
                <GroupBadges group={group} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <BarterBoard />

      <GroupDetails group={selectedGroup} onClose={() => setSelectedId(null)} badges={selectedGroup && <GroupBadges group={selectedGroup} />} />
    </motion.div>
  );
};

export default TradeSection;
