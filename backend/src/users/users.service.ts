import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../config/firebase.config';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly usersCollection = 'users';

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(createUserInput: CreateUserInput) {
    const hashedPassword = await bcrypt.hash(createUserInput.password, 10);
    const userDoc = {
      ...createUserInput,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await this.firebaseService
      .getFirestore()
      .collection(this.usersCollection)
      .add(userDoc);

    return {
      id: docRef.id,
      ...userDoc,
    };
  }

  async findAll() {
    const snapshot = await this.firebaseService
      .getFirestore()
      .collection(this.usersCollection)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async findOne(id: string) {
    const doc = await this.firebaseService
      .getFirestore()
      .collection(this.usersCollection)
      .doc(id)
      .get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    };
  }

  async findByEmail(email: string) {
    const snapshot = await this.firebaseService
      .getFirestore()
      .collection(this.usersCollection)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  }

  async update(id: string, updateUserInput: UpdateUserInput) {
    const updates = { ...updateUserInput, updatedAt: new Date() };

    if (updateUserInput.password) {
      updates.password = await bcrypt.hash(updateUserInput.password, 10);
    }

    await this.firebaseService
      .getFirestore()
      .collection(this.usersCollection)
      .doc(id)
      .update(updates);

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.firebaseService
      .getFirestore()
      .collection(this.usersCollection)
      .doc(id)
      .delete();

    return { id };
  }
}
