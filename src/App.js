import { useState, useEffect } from "react";
import { usePromiseTracker } from "react-promise-tracker";
import { trackPromise } from "react-promise-tracker";
import { SpinnerCircularFixed } from "spinners-react";
import "./App.css";

function App() {
  const [ravintolat, setRavintolat] = useState([]);
  const [ruokatyypit, setRuokatyypit] = useState([]);
  const [kaupunginosat, setKaupunginosat] = useState([]);
  const [ruokatyyppi, setRuokatyyppi] = useState("");
  const [kaupunginosa, setKaupunginosa] = useState("");
  const [osoite, setOsoite] = useState("");
  const [ravintolanNimi, setRavintolanNimi] = useState("");
  const [id, setId] = useState("");
  const [query, setQuery] = useState("");
  const [queryNumberGET, setQueryNumberGET] = useState(0);
  const [queryNumberGetByID, setQueryNumberGetByID] = useState(0);
  const [queryNumberEdit, setQueryNumberEdit] = useState(0);
  const [queryNumberPOST, setQueryNumberPOST] = useState(0);
  const [poistaRavintolaID, setPoistaRavintolaID] = useState("");
  const [showLandingpage, setShowLandingpage] = useState(true);
  const [showEditpage, setShowEditpage] = useState(false);
  const [showLisaaUusipage, setShowLisaaUusipage] = useState(false);
  const [eiHakutuloksia, setEiHakutuloksia] = useState(false);

  /// RAVINTOLOIDEN HAKU (KAIKKI TAI RAJATUIN HAKUEHDOIN) ///

  const haeRavintolat = () => {
    let q = "";
    if (ruokatyyppi !== "") {
      q = "cuisine=" + ruokatyyppi;
      setQuery(q);
    }
    if (kaupunginosa !== "") {
      if (q === "") {
        q = "borough=" + kaupunginosa;
        setQuery(q);
      } else {
        q = q + "&borough=" + kaupunginosa;
        setQuery(q);
      }
    }
    setQuery(q);
    setQueryNumberGET(queryNumberGET + 1);
  };

  useEffect(() => {
    const hae = async () => {
      let response = await fetch(
        "https://ravintolaapi.herokuapp.com/api/getall?" + query
      );
      let responseJSON = await response.json();
      setRavintolat(responseJSON);

      if (responseJSON.length === 0) {
        setEiHakutuloksia(true);
        const timer = setTimeout(() => {
          setEiHakutuloksia(false);
        }, 4000);
        return () => clearTimeout(timer);
      }
    };
    if (queryNumberGET > 0) hae();
  }, [queryNumberGET]);

  /// HAE RAVINTOLA ID:n PERUSTEELLA ///

  const haeIDperusteella = () => {
    if (id.length !== 24) {
      window.confirm("ID pituus täytyy olla 24 merkkiä.");
      setId("");
      return;
    }
    setQueryNumberGetByID(queryNumberGetByID + 1);
  };

  useEffect(() => {
    const haeID = async () => {
      let response = await fetch(
        "https://ravintolaapi.herokuapp.com/api/" + id
      );
      let responseJSON = await response.json();
      setId("");

      if (response.status != 200 || responseJSON === null) {
        setRavintolat([]);
        setEiHakutuloksia(true);
        const timer = setTimeout(() => {
          setEiHakutuloksia(false);
        }, 4000);
        return () => clearTimeout(timer);
      }

      setRavintolat([responseJSON]);
    };
    if (queryNumberGetByID > 0) haeID();
  }, [queryNumberGetByID]);

  /// MUOKKAA RAVINTOLA ///

  const muokkaaRavintola = (id, name, cuisine, borough, street) => {
    setShowLandingpage(false);
    setShowEditpage(true);
    setId(id);
    setRavintolanNimi(name);
    setRuokatyyppi(cuisine);
    setKaupunginosa(borough);
    setOsoite(street);
  };

  const peruutaMuokkaus = () => {
    setId("");
    setShowEditpage(false);
    setShowLisaaUusipage(false);
    setShowLandingpage(true);
  };

  const tallennaMuokkaus = () => {
    setQueryNumberEdit(queryNumberEdit + 1);
  };

  useEffect(() => {
    const tallennaMuokkausEffect = async () => {
      await fetch("https://ravintolaapi.herokuapp.com/api/update/" + id, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          address: {
            street: osoite,
          },
          name: ravintolanNimi,
          cuisine: ruokatyyppi,
          borough: kaupunginosa,
        }),
      }).then((response) => response.json());

      setRuokatyyppi("");
      setKaupunginosa("");
      setId("");
      setShowLandingpage(true);
      setShowEditpage(false);
      setQueryNumberGET(queryNumberGET + 1);
    };
    if (queryNumberEdit > 0) tallennaMuokkausEffect();
  }, [queryNumberEdit]);

  /// LISÄÄ RAVINTOLA ///

  const lisaaUusiRavintola = () => {
    setRavintolanNimi("");
    setRuokatyyppi("");
    setKaupunginosa("");
    setOsoite("");
    setShowLisaaUusipage(true);
    setShowLandingpage(false);
  };

  const tallennaUusiRavintola = () => {
    if (
      osoite == "" ||
      ravintolanNimi == "" ||
      ruokatyyppi == "" ||
      kaupunginosa == ""
    ) {
      window.confirm("Täytä kaikki kentät!");
      return;
    }
    setQueryNumberPOST(queryNumberPOST + 1);
  };

  useEffect(() => {
    const lisaaUusiRavintolaEffect = async () => {
      fetch("https://ravintolaapi.herokuapp.com/api/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: {
            street: osoite,
          },
          name: ravintolanNimi,
          cuisine: ruokatyyppi,
          borough: kaupunginosa,
        }),
      }).then((res) => res.json());
      window.confirm("Ravintola " + ravintolanNimi + " lisätty tietokantaan.");
      setQueryNumberGET(queryNumberGET + 1);
      setShowLandingpage(true);
      setShowLisaaUusipage(false);
    };
    if (queryNumberPOST > 0) lisaaUusiRavintolaEffect();
  }, [queryNumberPOST]);

  /// POISTA RAVINTOLA ///

  const poistaRavintola = (id, name) => {
    const confirmed = window.confirm(
      "Haluatko varmasti poistaa ravintolan " + name + "?"
    );
    if (confirmed) {
      setPoistaRavintolaID(id);
      window.confirm("Ravintola " + name + " poistettu.");
    } else {
      return;
    }
  };

  useEffect(() => {
    const poistaRavintolaEffect = async () => {
      await fetch(
        "https://ravintolaapi.herokuapp.com/api/delete/" + poistaRavintolaID,
        {
          method: "DELETE",
        }
      );
      setRavintolat(ravintolat.filter((a) => a._id !== poistaRavintolaID));
    };
    if (poistaRavintolaID !== "") poistaRavintolaEffect();
  }, [poistaRavintolaID]);

  /// HAKUFORMIN KOKOAMINEN ///

  // Hakee APIsta eri cuisinet
  useEffect(() => {
    const haeRuokatyypit = async () => {
      let response = await fetch(
        "https://ravintolaapi.herokuapp.com/api/cuisines"
      );
      let responseJSON = await response.json();
      setRuokatyypit(responseJSON);
    };
    trackPromise(haeRuokatyypit());
  }, []);
  // Käy cuisinet läpi ja asettaa muuttujaan
  const ruokatyyppiData = ruokatyypit.map((unit, index) => {
    return <option key={index}>{unit}</option>;
  });

  // Hakee APIsta eri kaupunginosat
  useEffect(() => {
    const haeKaupunginosat = async () => {
      let response = await fetch(
        "https://ravintolaapi.herokuapp.com/api/boroughs"
      );
      let responseJSON = await response.json();
      setKaupunginosat(responseJSON);
    };
    trackPromise(haeKaupunginosat());
  }, []);
  // Käy kapunginosat läpi ja asettaa muuttujaan
  const kaupunginosaData = kaupunginosat.map((unit, index) => {
    return <option key={index}>{unit}</option>;
  });

  return (
    <div>
      <div className="container">
        <div className="row justify-content-center">
          <h2>Ravintolat - ylläpitäjän hallintatyökalu</h2>
        </div>
        <div className="row justify-content-center">
          <Lataaviesti />
        </div>
        <div className="row justify-content-center">
          {showLandingpage && (
            <>
              <form className="lomake col-lg-5 col-sm-10">
                <h5>Hae ruokatyypin ja kaupunginosan perusteella</h5>
                <div className="form-group">
                  <label>Ruokatyyppi</label>
                  <select
                    className="form-control"
                    onChange={(e) => setRuokatyyppi(e.target.value)}
                  >
                    <option></option>
                    {ruokatyyppiData}
                  </select>
                  <label>Kaupunginosa</label>
                  <select
                    className="form-control"
                    onChange={(e) => setKaupunginosa(e.target.value)}
                  >
                    <option></option>
                    {kaupunginosaData}
                  </select>
                  <button
                    type="button"
                    className="btn btn-custom"
                    onClick={() => haeRavintolat()}
                  >
                    Hae
                  </button>
                  <button
                    type="button"
                    className="btn btn-custom"
                    onClick={() => lisaaUusiRavintola()}
                  >
                    Lisää uusi
                  </button>
                </div>
              </form>
              <br></br>
              <form className="lomake col-lg-5 col-sm-10">
                <div className="form-group">
                  <label>
                    <h5>Hae ID:n perusteella</h5>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                  ></input>
                  <small id="emailHelp" className="form-text text-muted">
                    ID:n pituus oltava 24 merkkiä.
                  </small>
                  <button
                    type="button"
                    className="btn btn-custom"
                    onClick={() => haeIDperusteella()}
                  >
                    Hae
                  </button>
                </div>
              </form>

              {eiHakutuloksia && (
                <p>Annetuilla hakuehdoilla ei löytynyt dataa</p>
              )}
              {ravintolat.length > 0 && (
                <Ravintolalista
                  ravintolat={ravintolat}
                  muokkaaRavintola={muokkaaRavintola}
                  poistaRavintola={poistaRavintola}
                />
              )}
            </>
          )}

          {showEditpage && (
            <form className="lomake">
              <h5>Muokkaa ravintolan tietoja</h5>
              <div className="form-group">
                <label>Nimi</label>
                <input
                  type="text"
                  className="form-control"
                  value={ravintolanNimi}
                  onChange={(e) => setRavintolanNimi(e.target.value)}
                ></input>
                <label>Ruokatyyppi</label>
                <input
                  type="text"
                  className="form-control"
                  value={ruokatyyppi}
                  onChange={(e) => setRuokatyyppi(e.target.value)}
                ></input>
                <label>Kaupunginosa</label>
                <input
                  type="text"
                  className="form-control"
                  value={kaupunginosa}
                  onChange={(e) => setKaupunginosa(e.target.value)}
                ></input>
                <label>Osoite</label>
                <input
                  type="text"
                  className="form-control"
                  value={osoite}
                  onChange={(e) => setOsoite(e.target.value)}
                ></input>

                <button
                  className="btn btn-success"
                  type="button"
                  onClick={() => tallennaMuokkaus()}
                >
                  Tallenna
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => peruutaMuokkaus()}
                >
                  Peruuta
                </button>
              </div>
            </form>
          )}

          {showLisaaUusipage && (
            <form className="lomake">
              <h5>Lisää uusi ravintola</h5>
              <div className="form-group">
                <label>Nimi</label>
                <input
                  type="text"
                  className="form-control"
                  value={ravintolanNimi}
                  onChange={(e) => setRavintolanNimi(e.target.value)}
                ></input>
                <label>Ruokatyyppi</label>
                <input
                  type="text"
                  className="form-control"
                  value={ruokatyyppi}
                  onChange={(e) => setRuokatyyppi(e.target.value)}
                ></input>
                <label>Kaupunginosa</label>
                <input
                  type="text"
                  className="form-control"
                  value={kaupunginosa}
                  onChange={(e) => setKaupunginosa(e.target.value)}
                ></input>
                <label>Osoite</label>
                <input
                  type="text"
                  className="form-control"
                  value={osoite}
                  onChange={(e) => setOsoite(e.target.value)}
                ></input>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => tallennaUusiRavintola()}
                >
                  Tallenna
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => peruutaMuokkaus()}
                >
                  Peruuta
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const Ravintolalista = (props) => {
  const ravintolaData = props.ravintolat.map((ravintola, index) => {
    return (
      <tr key={index}>
        <td>{ravintola.name}</td>
        <td>{ravintola.cuisine}</td>
        <td>{ravintola.borough}</td>
        <td>{ravintola.address.street}</td>
        <td>
          <button
            className="btn btn-primary"
            onClick={() =>
              props.muokkaaRavintola(
                ravintola._id,
                ravintola.name,
                ravintola.cuisine,
                ravintola.borough,
                ravintola.address.street
              )
            }
          >
            Muokkaa
          </button>
        </td>
        <td>
          <button
            className="btn btn-danger"
            onClick={() => props.poistaRavintola(ravintola._id, ravintola.name)}
          >
            Poista
          </button>
        </td>
      </tr>
    );
  });

  return (
    <table className="table table-hover">
      <caption>Lista ravintoloista</caption>
      <thead>
        <tr>
          <th>Nimi</th>
          <th>Ruokatyyppi</th>
          <th>Kaupunginosa</th>
          <th>Osoite</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>{ravintolaData}</tbody>
    </table>
  );
};

const Lataaviesti = () => {
  const { promiseInProgress } = usePromiseTracker();
  return promiseInProgress && <p>lataa</p>;
};

export default App;
