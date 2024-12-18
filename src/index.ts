import { Hono } from "hono";

const app = new Hono();

let provinces: any;
let districts: any;
let neighborhoods: any;
let villages: any;

const fetchData = async () => {
  provinces = await (
    await fetch(
      "https://raw.githubusercontent.com/ubeydeozdmr/turkiye-api/refs/heads/main/src/v1/data/provinces.json"
    )
  ).json();
  const _districts = await (
    await fetch(
      "https://raw.githubusercontent.com/ubeydeozdmr/turkiye-api/refs/heads/main/src/v1/data/districts.json"
    )
  ).json();
  districts = Object.groupBy(
    _districts,
    ({ provinceId }: { provinceId: any }) => provinceId
  );
  const _neighborhoods = await (
    await fetch(
      "https://raw.githubusercontent.com/ubeydeozdmr/turkiye-api/refs/heads/main/src/v1/data/neighborhoods.json"
    )
  ).json();
  neighborhoods = Object.groupBy(
    _neighborhoods,
    ({ districtId }: { districtId: any }) => districtId
  );
  const _villages = await (
    await fetch(
      "https://raw.githubusercontent.com/ubeydeozdmr/turkiye-api/refs/heads/main/src/v1/data/villages.json"
    )
  ).json();
  villages = Object.groupBy(
    _villages,
    ({ districtId }: { districtId: any }) => districtId
  );
};

fetchData();

app.get("/api/v1/check/:province/:district?/:neighborhood?", (c) => {
  const { province, district, neighborhood } = c.req.param();

  try {
    let check = false;

    if (neighborhood) {
      const _n = neighborhoods.find(
        ({ id }: { id: number }) => id === Number(neighborhood)
      );
      const n = _n
        ? _n
        : villages.find(
            ({ id }: { id: number }) => id === Number(neighborhood)
          );

      check =
        !!n &&
        n.districtId === Number(district) &&
        n.provinceId === Number(province);
    } else if (district) {
      const d = districts.find(
        ({ id }: { id: number }) => id === Number(district)
      );

      check = !!d && d.provinceId === Number(province);
    } else {
      check = !!provinces.find(
        ({ id }: { id: number }) => id === Number(province)
      );
    }

    return c.text(check ? "true" : "false", check ? 200 : 404);
  } catch {
    return c.text("false", 404);
  }
});

app.get("/api/v1", (c) => {
  try {
    const data = provinces;
    return c.json(data, 200);
  } catch {
    return c.text("404", 400);
  }
});

app.get("/api/v1/:province", (c) => {
  const { province } = c.req.param();

  try {
    const data = districts[province];
    return c.json(data, 200);
  } catch {
    return c.text("404", 400);
  }
});

app.get("/api/v1/:province/:district", (c) => {
  const { province, district } = c.req.param();

  try {
    const data = villages[district]
      ? neighborhoods[district].concat(villages[district])
      : neighborhoods[district];
    return c.json(data, 200);
  } catch {
    return c.text("404", 400);
  }
});

app.get("/api/v1/:province/:district/neighborhoods", (c) => {
  const { province, district } = c.req.param();

  try {
    const data = neighborhoods[district];
    return c.json(data, 200);
  } catch {
    return c.text("404", 400);
  }
});

app.get("/api/v1/:province/:district/villages", (c) => {
  const { province, district } = c.req.param();

  try {
    const data = villages[district];
    return c.json(data, 200);
  } catch {
    return c.text("404", 400);
  }
});

export default app;
