import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { t } from '../../content/strings';
import { UPI_ID } from '../../config/app';
import { shortId } from '../../utils/format';
import Modal from '../../components/common/Modal';
import { Confetti, SuccessCheck } from '../../components/motion';

// Standard UPI deep link; any UPI app can scan the QR it encodes.
const upiLink = (order) =>
  `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent('Bazar Buddy')}&am=${order.total}&cu=INR&tn=${encodeURIComponent(`Order ${shortId(order.id)}`)}`;

const OrderPlacedModal = ({ order, onClose }) => {
  const navigate = useNavigate();
  const track = () => {
    onClose();
    navigate('/orders');
  };

  return (
    <Modal open={Boolean(order)} title={t('orderSuccessTitle')} onClose={onClose}>
      {order && (
        <div className="order-success">
          <Confetti />
          <SuccessCheck />
          <p className="muted">{t('orderSuccessBody')}</p>
          {order.payment === 'upi' && (
            <motion.div className="upi-pay" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h3>{t('payViaUpi')}</h3>
              <div className="upi-qr">
                <QRCodeSVG value={upiLink(order)} size={184} level="M" fgColor="#26332a" title={t('scanToPay', { total: order.total })} />
              </div>
              <p>{t('scanToPay', { total: order.total })}</p>
              <p className="muted small">{t('upiId', { id: UPI_ID })}</p>
              <a className="btn btn-outline btn-sm upi-app-link" href={upiLink(order)}>{t('openUpiApp')}</a>
              <p className="muted small">{t('upiNote')}</p>
            </motion.div>
          )}
          <button type="button" className="btn btn-block" onClick={track}>{t('trackOrder')}</button>
        </div>
      )}
    </Modal>
  );
};

export default OrderPlacedModal;
