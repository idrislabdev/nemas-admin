'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input, Modal } from 'antd';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { MapContainer, Marker, TileLayer, Popup, useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { IUserAddress } from '@/@core/@types/interface';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-geosearch/dist/geosearch.css';
import axios from 'axios';
import TextArea from 'antd/es/input/TextArea';
import { translateProvince } from '@/@core/utils/general';
import axiosInstance from '@/@core/utils/axios';

const MyInnerMap: React.FC<{ open: boolean }> = ({ open }) => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 500);
  }, [map, open]);

  return null;
};

const ModalAddress = (props: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  userAddress: IUserAddress;
  setUserAddress: Dispatch<SetStateAction<IUserAddress>>;
  userId: string;
  setRefresData: Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    isModalOpen,
    setIsModalOpen,
    userAddress,
    setUserAddress,
    userId,
    setRefresData,
  } = props;
  const center = {
    lat: userAddress.latitude ?? -7.250445,
    lng: userAddress.longtitude ?? 112.768845,
  };
  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: userAddress.latitude ?? -7.250445,
    lng: userAddress.longtitude ?? 112.768845,
  });
  const markerRef = useRef<any>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
          getAddress(marker.getLatLng().lat, marker.getLatLng().lng);
        }
      },
    }),
    []
  );
  const Search = () => {
    const map = useMap(); // access to leaflet map
    useEffect(() => {
      const searchControl = GeoSearchControl({
        provider: new OpenStreetMapProvider(),
        style: 'bar',
        showMarker: false,
      });

      map.on('geosearch/showlocation', searchEventHandler);
      map.addControl(searchControl);
      return () => {
        map.removeControl(searchControl);
      };
    }, [map]);
    return null;
  };

  const searchEventHandler = (result: any) => {
    if (result) {
      setPosition({
        lat: parseFloat(result.location.raw.lat),
        lng: parseFloat(result.location.raw.lon),
      });
      getAddress(result.location.raw.lat, result.location.raw.lon);
    }
  };

  const setLocation = async () => {
    const body = userAddress;
    await axiosInstance.put(`users/admin/${userId}/address`, body);
    setRefresData(true);
    setIsModalOpen(false);
  };

  const getComponent = (components: any[], type: string) => {
    const comp = components.find((c) => c.types.includes(type));
    return comp ? comp.long_name : '';
  };

  const findPostalResult = (results: any[]) => {
    return (
      results.find((r) =>
        r.address_components.some((c: any) => c.types.includes('postal_code'))
      ) || results[0]
    );
  };

  const getAddress = async (lat: number, lng: number) => {
    const resp = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          latlng: `${lat},${lng}`,
          key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
        },
      }
    );

    const results = resp.data.results;

    if (!results?.length) return;

    const bestResult = findPostalResult(results);

    const components = bestResult.address_components;

    const temp: IUserAddress = {
      city: getComponent(components, 'administrative_area_level_2'),
      district: getComponent(components, 'administrative_area_level_3'),
      subdistrict:
        getComponent(components, 'administrative_area_level_4') ||
        getComponent(components, 'administrative_area_level_5'),
      postal_code: getComponent(components, 'postal_code'),
      address: bestResult.formatted_address ?? '-',
      is_default: true,
      latitude: lat,
      longtitude: lng,
      province: translateProvince(
        getComponent(components, 'administrative_area_level_1')
      ),
    };

    setUserAddress(temp);
  };

  return (
    <Modal
      title={'Set Alamat'}
      className="modal-form map"
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      footer={null}
      centered
      width={1000}
    >
      <div className="content-form !flex-row h-[550px]">
        <div className="flex flex-col justify-center w-1/2 border border-gray-300 form-map">
          <MapContainer
            style={{ width: '100%', height: '100%' }}
            center={center}
            zoom={12}
            scrollWheelZoom={true}
          >
            <MyInnerMap open={isModalOpen} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              ref={markerRef}
              eventHandlers={eventHandlers}
              draggable={true}
              position={position}
            >
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
            <Search />
          </MapContainer>
        </div>
        <div className="flex flex-col gap-[10px] w-1/2 form-input">
          <div className="flex flex-col gap-[4px]">
            <label>Kode Pos</label>
            <Input
              value={userAddress.postal_code}
              onChange={(e) =>
                setUserAddress({
                  ...userAddress,
                  postal_code: e.target.value,
                })
              }
              className="rounded-[4px]"
              size="large"
            />
          </div>
          <div className="flex flex-col gap-[4px]">
            <label>Provinsi</label>
            <Input
              value={userAddress.province}
              onChange={(e) =>
                setUserAddress({
                  ...userAddress,
                  province: e.target.value,
                })
              }
              className="rounded-[4px]"
              size="large"
            />
          </div>
          <div className="flex flex-col gap-[4px]">
            <label>Kota</label>
            <Input
              value={userAddress.city}
              onChange={(e) =>
                setUserAddress({
                  ...userAddress,
                  city: e.target.value,
                })
              }
              className="rounded-[4px]"
              size="large"
            />
          </div>
          <div className="flex flex-col gap-[4px]">
            <label>Kecamatan</label>
            <Input
              value={userAddress.district}
              onChange={(e) =>
                setUserAddress({
                  ...userAddress,
                  district: e.target.value,
                })
              }
              className="rounded-[4px]"
              size="large"
            />
          </div>
          <div className="flex flex-col gap-[4px]">
            <label>Kelurahan</label>
            <Input
              value={userAddress.subdistrict}
              onChange={(e) =>
                setUserAddress({
                  ...userAddress,
                  subdistrict: e.target.value,
                })
              }
              className="rounded-[4px]"
              size="large"
            />
          </div>
          <div className="flex flex-col gap-[4px]">
            <label>Alamat</label>
            <TextArea
              value={userAddress.address}
              onChange={(e) =>
                setUserAddress({
                  ...userAddress,
                  address: e.target.value,
                })
              }
              className="rounded-[4px]"
              autoSize={{ minRows: 3, maxRows: 3 }}
            />
          </div>
        </div>
      </div>
      <div className="content-footer">
        <button
          className="btn bg-red-500 !h-[50px] justify-center text-white font-medium rounded-[4px] w-1/2"
          onClick={() => setIsModalOpen(false)}
        >
          BATAL
        </button>
        <button
          className="btn bg-primary !h-[50px] justify-center text-white font-medium rounded-[4px] w-1/2"
          onClick={() => setLocation()}
        >
          SET ALAMAT
        </button>
      </div>
    </Modal>
  );
};

export default ModalAddress;
