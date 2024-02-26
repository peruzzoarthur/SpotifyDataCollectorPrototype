import * as fs from 'fs';
// import * as path from 'path';
import * as csvParser from 'csv-parser';
import { Injectable } from '@nestjs/common';
// import { CreateCountryDto } from './dto/create-country.dto';
// import { UpdateCountryDto } from './dto/update-country.dto';
import { Country } from './entities/country.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private countriesRepository: Repository<Country>,
  ) {}
  async createFromCsv() {
    const csvFilePath =
      '/dev-arthur/Projects/Studies/Nestjs/SpotifyDataCollectorPrototype/nest-app/src/utils/countries.csv';

    try {
      const stream = fs.createReadStream(csvFilePath).pipe(csvParser());

      const countriesToSave = []; // Array to store countries to save

      for await (const row of stream) {
        const country = new Country();
        country.longitude = parseFloat(row.longitude);
        country.latitude = parseFloat(row.latitude);
        country.name = row.COUNTRY;
        country.countryCode = row.ISO;

        const create = this.countriesRepository.create(country);
        countriesToSave.push(create);
      }

      // Save all countries outside the loop
      const savedCountries =
        await this.countriesRepository.save(countriesToSave);

      console.log('Data import completed.');
      return savedCountries;
    } catch (error) {
      throw new Error(error); // Propagate the error
    }
  }

  async findAll() {
    return await this.countriesRepository.find();
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} country`;
  // }

  // update(id: number, updateCountryDto: UpdateCountryDto) {
  //   return `This action updates a #${id} country`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} country`;
  // }
}
