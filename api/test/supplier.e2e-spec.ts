import { HttpStatus, INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { managerUser, supplierDTO } from "./utils/mockdata";
import { initializeTestApp } from "./utils";
import { Repository } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
describe("AppController (e2e)", () => {
  let app: INestApplication;
  let managerAccessToken: string;
  let userReposity: Repository<User>;

  beforeAll(async () => {
    app = await initializeTestApp();
    userReposity = app.get<Repository<User>>(getRepositoryToken(User));
    userReposity.save([managerUser]);

    const loginResponse = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: managerUser.email, password: "pasS!word123" })
      .expect(HttpStatus.OK);
    managerAccessToken = loginResponse.body.payload.accessToken;
  }, 60000);

  it("/api/v1/suppliers Unauthorized (POST)", async () => {
    return request(app.getHttpServer())
      .post("/api/v1/suppliers")
      .send(supplierDTO)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it("/api/v1/suppliers (POST)", async () => {
    return request(app.getHttpServer())
      .post("/api/v1/suppliers")
      .set("Authorization", `Bearer ${managerAccessToken}`)
      .send(supplierDTO)
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "Supplier successfully registered",
        );
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
