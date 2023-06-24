import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { storage } from '../firebaseConfig';
import { ref, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, onValue } from 'firebase/database';

const Certificate = () => {
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participantName, setParticipantName] = useState('');
  const [workshopNames, setWorkshopNames] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const db = getDatabase();
      const participantRef = dbRef(db, `users/${id}`);

      onValue(participantRef, (snapshot) => {
        const participantData = snapshot.val();
        if (participantData && participantData.name) {
          setParticipantName(participantData.name);
          fetchWorkshopData(participantData.wid);
        }
      });

      try {
        const url = await getDownloadURL(ref(storage, `/${id}.png`));
        setImageUrl(url);
        setLoading(false);
      } catch (error) {
        setImageUrl(null);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const fetchWorkshopData = async (widArray) => {
    const db = getDatabase();
    const workshopsRef = dbRef(db, 'workshops');

    onValue(workshopsRef, (snapshot) => {
      const workshopsData = snapshot.val();
      const workshopNames = widArray.map((wid) => workshopsData[wid].wname);
      setWorkshopNames(workshopNames.join(', '));
    });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'certificate';
    link.click();
  };

  return (
    <div className="cert">
      {/* Testing purpose */}
      Now showing post {id}

      <h2 className="cert-header">Participant Name: {participantName}</h2>
      <h2 className="cert-header">Workshop Name(s): {workshopNames}</h2>
      <div className="grid-container">
        <div className="image-container">
          {loading ? (
            <p>Loading...</p>
          ) : imageUrl ? (
            <img src={imageUrl} alt="Your Cert" />
          ) : (
            <div>Not found...</div>
          )}
        </div>
        <div className="button-container">
          <div className="button" onClick={handleDownload}>
            Download Certificate
          </div>
          <div className="button">Share Via LinkedIn</div>
          <div className="button">Add to LinkedIn Profile</div>
          <div className="button">Copy Link</div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
