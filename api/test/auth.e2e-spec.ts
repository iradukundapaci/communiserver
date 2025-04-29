import { HttpStatus, INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { signInDto, signUpDto, tokenService } from "./utils/mockdata";
import { ResetPasswordDto } from "src/auth/dto/reset-password.dto";
import { ForgotPasswordDto } from "src/auth/dto/forgot-password.dto";
import { initializeTestApp } from "./utils";
describe("AppController (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    app = await initializeTestApp();
  }, 60000);

  it("/api/v1/auth/signup (POST)", async () => {
    return request(app.getHttpServer())
      .post("/api/v1/auth/signup")
      .send(signUpDto)
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "User successfully registered",
        );
      });
  });

  it("/api/v1/auth/signup (POST)", async () => {
    signUpDto.password = "password123";
    return request(app.getHttpServer())
      .post("/api/v1/auth/signup")
      .send(signUpDto)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it("/api/v1/auth/signup (POST)", async () => {
    signUpDto.password = "pasS!word123";
    return request(app.getHttpServer())
      .post("/api/v1/auth/signup")
      .send(signUpDto)
      .expect(HttpStatus.CONFLICT);
  });

  it("/api/v1/auth/verify (PATCH)", async () => {
    const token = tokenService.generateEmailToken(signInDto.email);
    return request(app.getHttpServer())
      .patch("/api/v1/auth/verify")
      .send({ token })
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "Email verified successfully",
        );
      });
  });

  it("/api/v1/auth/verify (PATCH)", async () => {
    const token = "invalidToken";
    return request(app.getHttpServer())
      .patch("/api/v1/auth/verify")
      .send({ token })
      .expect(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it("/api/v1/auth/verify (PATCH)", async () => {
    const token = tokenService.generateEmailToken("bD5U5@example.com");
    return request(app.getHttpServer())
      .patch("/api/v1/auth/verify")
      .send({ token })
      .expect(HttpStatus.NOT_FOUND);
  });

  it("/api/v1/auth/login (POST)", async () => {
    signInDto.email = "bD5U5@example.com";
    return request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send(signInDto)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it("/api/v1/auth/login (POST)", async () => {
    signInDto.email = "bD5U5";
    return request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send(signInDto)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it("/api/v1/auth/login (POST)", async () => {
    signInDto.email = "paciexample@gmail.com";
    const loginResponse = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send(signInDto)
      .expect(HttpStatus.OK);
    expect(loginResponse.body).toHaveProperty(
      "message",
      "Logged in successfully",
    );
    expect(loginResponse.body).toHaveProperty("payload.accessToken");
    expect(loginResponse.body).toHaveProperty("payload.refreshToken");

    accessToken = loginResponse.body.payload.accessToken;
    refreshToken = loginResponse.body.payload.refreshToken;
  });

  it("/api/v1/auth/refresh-token (PATCH)", async () => {
    return request(app.getHttpServer())
      .patch("/api/v1/auth/refresh-token")
      .set("Authorization", `Bearer ${refreshToken}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "Token refreshed successfully",
        );
        expect(res.body).toHaveProperty("payload.accessToken");
        expect(res.body).toHaveProperty("payload.refreshToken");
      });
  });

  it("/api/v1/auth/refresh-token (PATCH)", async () => {
    return request(app.getHttpServer())
      .patch("/api/v1/auth/refresh-token")
      .set("Authorization", `Bearer "refresh-token"`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it("/api/v1/auth/logout (POST)", async () => {
    return request(app.getHttpServer())
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveProperty("message", "Logged out successfully");
      });
  });

  it("/api/v1/auth/logout (POST)", async () => {
    return request(app.getHttpServer())
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it("/api/v1/auth/logout (POST)", async () => {
    return request(app.getHttpServer())
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer "access-token"`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it("/api/v1/auth/forgot-password (POST)", async () => {
    return request(app.getHttpServer())
      .post("/api/v1/auth/forgot-password")
      .send({ email: signInDto.email })
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "Reset email sent successfully",
        );
      });
  });

  it("/api/v1/auth/forgot-password (POST)", async () => {
    const forgotPasswordDto = new ForgotPasswordDto.Input();
    forgotPasswordDto.email = "invalid@gmail.com";

    return request(app.getHttpServer())
      .post("/api/v1/auth/forgot-password")
      .send(forgotPasswordDto)
      .expect(HttpStatus.NOT_FOUND);
  });

  it("/api/v1/auth/forgot-password (POST)", async () => {
    return request(app.getHttpServer())
      .post("/api/v1/auth/forgot-password")
      .send(signInDto.email)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it("/api/v1/auth/reset-password (POST)", async () => {
    const token = tokenService.generateEmailToken(signInDto.email);
    const resetPasswordDto = new ResetPasswordDto.Input();
    resetPasswordDto.password = "pasS!word123";
    resetPasswordDto.token = token;

    return request(app.getHttpServer())
      .post("/api/v1/auth/reset-password")
      .send(resetPasswordDto)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "Password reset successfully",
        );
      });
  });

  it("/api/v1/auth/reset-password (POST)", async () => {
    const token = tokenService.generateEmailToken(signInDto.email);
    const resetPasswordDto = new ResetPasswordDto.Input();
    resetPasswordDto.password = "password";
    resetPasswordDto.token = token;

    return request(app.getHttpServer())
      .post("/api/v1/auth/reset-password")
      .send(resetPasswordDto)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it("/api/v1/auth/reset-password (POST)", async () => {
    const token = tokenService.generateEmailToken("invalid@gmail.com");
    const resetPasswordDto = new ResetPasswordDto.Input();
    resetPasswordDto.password = "paSS!word123";
    resetPasswordDto.token = token;

    return request(app.getHttpServer())
      .post("/api/v1/auth/reset-password")
      .send(resetPasswordDto)
      .expect(HttpStatus.NOT_FOUND);
  });

  afterAll(async () => {
    await app.close();
  });
});
